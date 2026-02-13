/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { createMatchmaker } from '@/lib/multiplayer/matchmaking';

export const runtime = 'edge';

/**
 * POST /api/tournaments/[id]/match/[matchId]/room
 * Create a multiplayer room for a tournament match.
 * If a room already exists for this match, return it.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; matchId: string } }
) {
  try {
    const { id: tournamentId, matchId } = params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get internal user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', userId)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get tournament
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    if (!tournament || tournament.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Tournament not found or not in progress' },
        { status: 400 }
      );
    }

    // Get match
    const { data: match } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('id', matchId)
      .eq('tournament_id', tournamentId)
      .single();

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // Validate user is a player in this match
    if (user.id !== match.player1_id && user.id !== match.player2_id) {
      return NextResponse.json(
        { error: 'You are not a player in this match' },
        { status: 403 }
      );
    }

    // If room already exists, return it
    if (match.room_id) {
      const { data: existingRoom } = await supabase
        .from('multiplayer_rooms')
        .select('*')
        .eq('id', match.room_id)
        .single();

      if (existingRoom) {
        return NextResponse.json({
          success: true,
          room: existingRoom,
          roomCode: existingRoom.room_code,
          alreadyExists: true,
        });
      }
    }

    // Create a private room for this match
    const matchmaker = createMatchmaker(match.player1_id);
    const room = await matchmaker.createRoom(
      tournament.game_id,
      '1v1-casual',
      true // private room with code
    );

    // Link room to tournament match
    await supabase
      .from('tournament_matches')
      .update({
        room_id: room.id,
        status: 'playing',
      })
      .eq('id', matchId);

    console.log(`[Tournament] Room ${room.id} created for match ${matchId} in tournament ${tournamentId}`);

    return NextResponse.json({
      success: true,
      room,
      roomCode: room.room_code,
      alreadyExists: false,
    });
  } catch (error) {
    console.error('[Tournament Room] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
