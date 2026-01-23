/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { updateStatsAfterMatch } from '@/lib/multiplayer/elo';

export const runtime = 'edge';


interface RouteParams {
  params: Promise<{ roomId: string }>;
}

interface LeaveRequest {
  userId: string;
}

/**
 * POST /api/multiplayer/rooms/[roomId]/leave
 * Leave a room (disconnect or forfeit)
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { roomId } = await params;
    const body: LeaveRequest = await request.json();
    const { userId } = body;

    if (!roomId || !userId) {
      return NextResponse.json(
        { error: 'roomId and userId are required' },
        { status: 400 }
      );
    }

    // Get room
    const { data: room, error: roomError } = await supabase
      .from('multiplayer_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomError || !room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Get player
    const { data: player } = await supabase
      .from('multiplayer_room_players')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .single();

    if (!player) {
      return NextResponse.json(
        { error: 'You are not in this room' },
        { status: 403 }
      );
    }

    // Mark player as disconnected
    await supabase
      .from('multiplayer_room_players')
      .update({
        disconnected: true,
        disconnected_at: new Date().toISOString(),
      })
      .eq('room_id', roomId)
      .eq('user_id', userId);

    // Handle based on room status
    if (room.status === 'waiting') {
      // If waiting, just remove from room
      // If room is now empty, cancel it
      const { data: remainingPlayers } = await supabase
        .from('multiplayer_room_players')
        .select('user_id')
        .eq('room_id', roomId)
        .eq('disconnected', false);

      if (!remainingPlayers || remainingPlayers.length === 0) {
        await supabase
          .from('multiplayer_rooms')
          .update({ status: 'cancelled' })
          .eq('id', roomId);
      }

      return NextResponse.json({
        success: true,
        message: 'Left room',
        gameEnded: false,
      });
    }

    if (room.status === 'playing') {
      // Game is in progress - this is a forfeit
      // Get opponent
      const { data: opponent } = await supabase
        .from('multiplayer_room_players')
        .select('user_id')
        .eq('room_id', roomId)
        .neq('user_id', userId)
        .eq('disconnected', false)
        .single();

      // End game with opponent as winner
      await supabase
        .from('multiplayer_rooms')
        .update({
          status: 'finished',
          finished_at: new Date().toISOString(),
          winner_id: opponent?.user_id || null,
        })
        .eq('id', roomId);

      // Record surrender action
      await supabase
        .from('multiplayer_actions')
        .insert({
          room_id: roomId,
          user_id: userId,
          action_type: 'surrender',
          action_data: { reason: 'disconnect' },
        });

      // Update ELO for ranked matches
      if (room.mode === '1v1-ranked' && opponent?.user_id) {
        try {
          await updateStatsAfterMatch({
            winnerId: opponent.user_id,
            loserId: userId,
            isDraw: false,
            gameId: room.game_id,
            mode: '1v1-ranked',
          });
        } catch (eloError) {
          console.error('[Multiplayer API] Failed to update ELO:', eloError);
          // Don't fail the request if ELO update fails
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Forfeited game',
        gameEnded: true,
        winnerId: opponent?.user_id || null,
      });
    }

    // Game already finished
    return NextResponse.json({
      success: true,
      message: 'Left room',
      gameEnded: room.status === 'finished',
    });
  } catch (error) {
    console.error('[Multiplayer API] Error leaving room:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
