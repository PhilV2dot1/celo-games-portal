/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export const runtime = 'edge';


interface RouteParams {
  params: Promise<{ roomId: string }>;
}

/**
 * GET /api/multiplayer/rooms/[roomId]
 * Get room details with players
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { roomId } = await params;

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }

    // Get room with players
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

    // Get players with user info
    const { data: players, error: playersError } = await supabase
      .from('multiplayer_room_players')
      .select(`
        *,
        users (
          id,
          username,
          display_name,
          avatar_url,
          theme_color,
          total_points
        )
      `)
      .eq('room_id', roomId)
      .eq('disconnected', false)
      .order('player_number', { ascending: true });

    if (playersError) {
      console.error('[Multiplayer API] Error fetching players:', playersError);
    }

    // Get player stats for ranked mode
    let playerStats = null;
    if (room.mode === '1v1-ranked' && players && players.length > 0) {
      const userIds = players.map((p: any) => p.user_id);
      const { data: stats } = await supabase
        .from('multiplayer_stats')
        .select('*')
        .eq('game_id', room.game_id)
        .eq('mode', '1v1-ranked')
        .in('user_id', userIds);

      playerStats = stats;
    }

    return NextResponse.json({
      success: true,
      room,
      players: players || [],
      playerStats,
    });
  } catch (error) {
    console.error('[Multiplayer API] Error getting room:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/multiplayer/rooms/[roomId]
 * Update room (game state, status)
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { roomId } = await params;
    const body = await request.json();
    const { game_state, status, winner_id } = body;

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }

    // Build update object
    const updates: Record<string, unknown> = {};

    if (game_state !== undefined) {
      updates.game_state = game_state;
    }

    if (status) {
      updates.status = status;
      if (status === 'playing') {
        updates.started_at = new Date().toISOString();
      } else if (status === 'finished') {
        updates.finished_at = new Date().toISOString();
      }
    }

    if (winner_id !== undefined) {
      updates.winner_id = winner_id;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid update fields provided' },
        { status: 400 }
      );
    }

    const { data: room, error } = await supabase
      .from('multiplayer_rooms')
      .update(updates)
      .eq('id', roomId)
      .select()
      .single();

    if (error) {
      console.error('[Multiplayer API] Error updating room:', error);
      return NextResponse.json(
        { error: 'Failed to update room', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      room,
    });
  } catch (error) {
    console.error('[Multiplayer API] Error updating room:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
