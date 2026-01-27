/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { createMatchmaker } from '@/lib/multiplayer/matchmaking';

export const runtime = 'edge';

interface FindMatchRequest {
  userId: string;
  gameId: string;
  mode: 'ranked' | 'casual';
}

/**
 * POST /api/multiplayer/match
 * Find or create a match for a user
 */
export async function POST(request: NextRequest) {
  try {
    const body: FindMatchRequest = await request.json();
    const { userId, gameId, mode } = body;

    // Validate required fields
    if (!userId || !gameId || !mode) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, gameId, mode' },
        { status: 400 }
      );
    }

    // Validate mode
    if (!['ranked', 'casual'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be: ranked or casual' },
        { status: 400 }
      );
    }

    // Get or create user from auth ID
    let user = await (supabase
      .from('users') as any)
      .select('id, auth_user_id')
      .eq('auth_user_id', userId)
      .single()
      .then((res: any) => res.data);

    // If user doesn't exist, create them
    if (!user) {
      console.log('[Multiplayer API] User not found, creating profile for:', userId);

      // Create user profile
      const { data: newUser, error: createError } = await (supabase
        .from('users') as any)
        .insert({
          auth_user_id: userId,
          username: `Player_${userId.substring(0, 8)}`,
          auth_provider: 'oauth',
          is_anonymous: false,
          claimed_at: new Date().toISOString(),
          total_points: 0,
          avatar_type: 'default',
        })
        .select('id, auth_user_id')
        .single();

      if (createError) {
        console.error('[Multiplayer API] Error creating user:', createError);

        // Try to fetch again in case of race condition
        const { data: retryUser } = await (supabase
          .from('users') as any)
          .select('id, auth_user_id')
          .eq('auth_user_id', userId)
          .single();

        user = retryUser;
      } else {
        user = newUser;
        console.log('[Multiplayer API] Created user profile:', user);
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user profile. Please try again.' },
        { status: 500 }
      );
    }

    // Use the users table ID for multiplayer operations
    const internalUserId = (user as any).id;

    // Check if user is already in an active room for this game
    const { data: existingRooms } = await (supabase
      .from('multiplayer_room_players') as any)
      .select(`
        room_id,
        multiplayer_rooms!inner (
          id,
          game_id,
          status
        )
      `)
      .eq('user_id', internalUserId)
      .eq('disconnected', false);

    // Filter for active rooms in this game
    const activeRoom = existingRooms?.find((r: any) =>
      r.multiplayer_rooms?.game_id === gameId &&
      ['waiting', 'playing'].includes(r.multiplayer_rooms?.status)
    );

    if (activeRoom) {
      // User is already in a room for this game
      const { data: room } = await (supabase
        .from('multiplayer_rooms') as any)
        .select('*')
        .eq('id', (activeRoom as any).room_id)
        .single();

      return NextResponse.json({
        success: true,
        room,
        isNewRoom: false,
        alreadyInRoom: true,
        message: 'You are already in a room for this game',
      });
    }

    // Find or create match (use internal user ID)
    const matchmaker = createMatchmaker(internalUserId);
    const result = await matchmaker.findMatch(gameId, mode);

    // If joined existing room, we need to add the player
    if (!result.isNewRoom) {
      await matchmaker.joinRoom(result.room.id);
    }

    // Get updated room with players
    const { data: roomWithPlayers } = await (supabase
      .from('multiplayer_rooms') as any)
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
      .eq('id', result.room.id)
      .single();

    console.log('[Multiplayer API] Match found:', {
      roomId: result.room.id,
      gameId,
      mode,
      isNewRoom: result.isNewRoom,
      currentPlayers: roomWithPlayers?.current_players,
    });

    return NextResponse.json({
      success: true,
      room: roomWithPlayers || result.room,
      isNewRoom: result.isNewRoom,
      alreadyInRoom: false,
    });
  } catch (error) {
    console.error('[Multiplayer API] Error finding match:', error);
    return NextResponse.json(
      { error: 'Failed to find match', details: String(error) },
      { status: 500 }
    );
  }
}
