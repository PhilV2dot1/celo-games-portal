/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { createMatchmaker } from '@/lib/multiplayer/matchmaking';
import type { RoomMode } from '@/lib/multiplayer/types';

export const runtime = 'edge';


interface CreateRoomRequest {
  userId: string;
  gameId: string;
  mode: RoomMode;
  isPrivate?: boolean;
}

/**
 * POST /api/multiplayer/rooms
 * Create a new multiplayer room
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateRoomRequest = await request.json();
    const { userId, gameId, mode, isPrivate = false } = body;

    // Validate required fields
    if (!userId || !gameId || !mode) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, gameId, mode' },
        { status: 400 }
      );
    }

    // Validate mode
    const validModes: RoomMode[] = ['1v1-ranked', '1v1-casual', 'collaborative'];
    if (!validModes.includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be: 1v1-ranked, 1v1-casual, or collaborative' },
        { status: 400 }
      );
    }

    // Verify user exists
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create room using matchmaker
    const matchmaker = createMatchmaker(userId);
    const room = await matchmaker.createRoom(gameId, mode, isPrivate);

    console.log('[Multiplayer API] Room created:', {
      roomId: room.id,
      gameId,
      mode,
      isPrivate,
      roomCode: room.room_code,
    });

    return NextResponse.json({
      success: true,
      room,
      roomCode: room.room_code,
    });
  } catch (error) {
    console.error('[Multiplayer API] Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room', details: String(error) },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ListRoomsQuery {
  gameId?: string;
  mode?: RoomMode;
  limit?: string;
}

/**
 * GET /api/multiplayer/rooms
 * List available (waiting) rooms for a game
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');
    const mode = searchParams.get('mode') as RoomMode | null;
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (!gameId) {
      return NextResponse.json(
        { error: 'gameId query parameter is required' },
        { status: 400 }
      );
    }

    // Build query
    let query = supabase
      .from('multiplayer_rooms')
      .select(`
        *,
        multiplayer_room_players (
          user_id,
          player_number,
          ready,
          users (
            username,
            display_name,
            avatar_url,
            theme_color
          )
        )
      `)
      .eq('game_id', gameId)
      .eq('status', 'waiting')
      .is('room_code', null) // Only public rooms
      .order('created_at', { ascending: false })
      .limit(limit);

    if (mode) {
      query = query.eq('mode', mode);
    }

    const { data: rooms, error } = await query;

    if (error) {
      console.error('[Multiplayer API] Error fetching rooms:', error);
      return NextResponse.json(
        { error: 'Failed to fetch rooms', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      rooms: rooms || [],
      count: rooms?.length || 0,
    });
  } catch (error) {
    console.error('[Multiplayer API] Error listing rooms:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
