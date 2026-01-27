/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { createMatchmaker } from '@/lib/multiplayer/matchmaking';

export const runtime = 'edge';

// Type assertion helper for Supabase queries on multiplayer tables
const db = supabase as any;

interface JoinByCodeRequest {
  userId: string;
  roomCode: string;
}

/**
 * POST /api/multiplayer/join-code
 * Join a private room by code
 */
export async function POST(request: NextRequest) {
  try {
    const body: JoinByCodeRequest = await request.json();
    const { userId, roomCode } = body;

    // Validate required fields
    if (!userId || !roomCode) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, roomCode' },
        { status: 400 }
      );
    }

    // Normalize code
    const normalizedCode = roomCode.toUpperCase().trim();

    // Validate code format (6 alphanumeric characters)
    if (!/^[A-Z0-9]{6}$/.test(normalizedCode)) {
      return NextResponse.json(
        { error: 'Invalid room code format' },
        { status: 400 }
      );
    }

    // Verify user exists (userId is the Supabase Auth ID)
    const { data: user } = await supabase
      .from('users')
      .select('id, auth_user_id')
      .eq('auth_user_id', userId)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please make sure you have a profile created.' },
        { status: 404 }
      );
    }

    // Use the users table ID for multiplayer operations
    const internalUserId = user.id;

    // Find room by code
    const { data: room, error: roomError } = await db
      .from('multiplayer_rooms')
      .select('*')
      .eq('room_code', normalizedCode)
      .single();

    if (roomError || !room) {
      return NextResponse.json(
        { error: 'Room not found. Please check the code and try again.' },
        { status: 404 }
      );
    }

    // Check room status
    if (room.status !== 'waiting') {
      return NextResponse.json(
        { error: 'This room is no longer accepting players' },
        { status: 400 }
      );
    }

    // Check if room is full
    if (room.current_players >= room.max_players) {
      return NextResponse.json(
        { error: 'Room is full' },
        { status: 400 }
      );
    }

    // Check if user is already in the room
    const { data: existingPlayer } = await db
      .from('multiplayer_room_players')
      .select('*')
      .eq('room_id', room.id)
      .eq('user_id', internalUserId)
      .single();

    if (existingPlayer) {
      if (existingPlayer.disconnected) {
        // Reconnect
        await db
          .from('multiplayer_room_players')
          .update({ disconnected: false, disconnected_at: null })
          .eq('room_id', room.id)
          .eq('user_id', internalUserId);

        return NextResponse.json({
          success: true,
          room,
          playerNumber: existingPlayer.player_number,
          reconnected: true,
        });
      }

      return NextResponse.json(
        { error: 'You are already in this room' },
        { status: 400 }
      );
    }

    // Join room
    const matchmaker = createMatchmaker(internalUserId);
    const player = await matchmaker.joinRoom(room.id);

    // Get updated room with all players
    const { data: updatedRoom } = await db
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
      .eq('id', room.id)
      .single();

    console.log('[Multiplayer API] Joined room by code:', {
      roomId: room.id,
      roomCode: normalizedCode,
      userId,
      playerNumber: player.player_number,
    });

    return NextResponse.json({
      success: true,
      room: updatedRoom || room,
      playerNumber: player.player_number,
      reconnected: false,
    });
  } catch (error) {
    console.error('[Multiplayer API] Error joining by code:', error);
    return NextResponse.json(
      { error: 'Failed to join room', details: String(error) },
      { status: 500 }
    );
  }
}
