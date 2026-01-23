/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/**
 * Matchmaking System
 * Handles finding and creating multiplayer rooms
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabase/client';
import {
  MultiplayerRoom,
  RoomPlayer,
  RoomMode,
  FindMatchResponse,
} from './types';
import { getOrCreateStats } from './elo';

// Type assertion helper for Supabase queries on multiplayer tables
const db = supabase as any;

// ELO range for ranked matchmaking
const INITIAL_ELO_RANGE = 100;
const MAX_ELO_RANGE = 500;
const ELO_RANGE_INCREMENT = 50;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SEARCH_TIMEOUT_MS = 30000; // 30 seconds (for future use)

// Room code characters (excluding ambiguous chars like I, O, 0, 1)
const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generate a random room code
 */
export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}

/**
 * Matchmaker class for finding and creating rooms
 */
export class Matchmaker {
  private userId: string;
  private searchAbortController: AbortController | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Find or create a match
   */
  async findMatch(
    gameId: string,
    mode: 'ranked' | 'casual'
  ): Promise<FindMatchResponse> {
    const roomMode: RoomMode = mode === 'ranked' ? '1v1-ranked' : '1v1-casual';

    if (mode === 'ranked') {
      return this.findRankedMatch(gameId, roomMode);
    }
    return this.findCasualMatch(gameId, roomMode);
  }

  /**
   * Find ranked match based on ELO similarity
   */
  private async findRankedMatch(
    gameId: string,
    mode: RoomMode
  ): Promise<FindMatchResponse> {
    // Get player's ELO
    const stats = await getOrCreateStats(this.userId, gameId, mode as '1v1-ranked');
    const playerElo = stats.elo_rating;

    // Start with narrow ELO range, expand if needed
    let eloRange = INITIAL_ELO_RANGE;

    while (eloRange <= MAX_ELO_RANGE) {
      // Find waiting rooms with similar ELO
      const { data: rooms } = await db
        .from('multiplayer_rooms')
        .select(`
          *,
          multiplayer_room_players!inner (
            user_id,
            multiplayer_stats!inner (
              elo_rating
            )
          )
        `)
        .eq('game_id', gameId)
        .eq('mode', mode)
        .eq('status', 'waiting')
        .neq('created_by', this.userId)
        .limit(10);

      if (rooms && rooms.length > 0) {
        // Find best match by ELO
        for (const room of rooms) {
          const players = room.multiplayer_room_players as any[];
          if (players.length > 0) {
            const opponentElo = players[0]?.multiplayer_stats?.elo_rating ?? 1000;
            if (Math.abs(opponentElo - playerElo) <= eloRange) {
              // Found a match within ELO range
              return {
                room: room as MultiplayerRoom,
                isNewRoom: false,
              };
            }
          }
        }
      }

      // Expand search range
      eloRange += ELO_RANGE_INCREMENT;
    }

    // No suitable match found, create new room
    const newRoom = await this.createRoom(gameId, mode);
    return { room: newRoom, isNewRoom: true };
  }

  /**
   * Find casual match (first available)
   */
  private async findCasualMatch(
    gameId: string,
    mode: RoomMode
  ): Promise<FindMatchResponse> {
    // Find any waiting room
    const { data: rooms } = await db
        .from('multiplayer_rooms')
      .select('*')
      .eq('game_id', gameId)
      .eq('mode', mode)
      .eq('status', 'waiting')
      .neq('created_by', this.userId)
      .lt('current_players', 2)
      .order('created_at', { ascending: true })
      .limit(1);

    if (rooms && rooms.length > 0) {
      return {
        room: rooms[0] as MultiplayerRoom,
        isNewRoom: false,
      };
    }

    // No room found, create new one
    const newRoom = await this.createRoom(gameId, mode);
    return { room: newRoom, isNewRoom: true };
  }

  /**
   * Create a new room
   */
  async createRoom(
    gameId: string,
    mode: RoomMode,
    isPrivate: boolean = false
  ): Promise<MultiplayerRoom> {
    const roomData: Partial<MultiplayerRoom> = {
      game_id: gameId,
      mode,
      status: 'waiting',
      max_players: mode === 'collaborative' ? 4 : 2,
      current_players: 0,
      created_by: this.userId,
      room_code: isPrivate ? await this.getUniqueRoomCode() : null,
      game_state: {},
    };

    const { data: room, error } = await db
        .from('multiplayer_rooms')
      .insert(roomData)
      .select()
      .single();

    if (error) {
      console.error('[Matchmaker] Failed to create room:', error);
      throw error;
    }

    // Add creator as player 1
    await this.joinRoom(room.id, 1);

    return room as MultiplayerRoom;
  }

  /**
   * Join an existing room
   */
  async joinRoom(roomId: string, playerNumber?: number): Promise<RoomPlayer> {
    // Get room to determine player number if not specified
    if (!playerNumber) {
      const { data: room } = await db
        .from('multiplayer_rooms')
        .select('current_players')
        .eq('id', roomId)
        .single();

      playerNumber = (room?.current_players ?? 0) + 1;
    }

    const playerData = {
      room_id: roomId,
      user_id: this.userId,
      player_number: playerNumber,
      ready: false,
      disconnected: false,
    };

    const { data: player, error } = await db
        .from('multiplayer_room_players')
      .insert(playerData)
      .select()
      .single();

    if (error) {
      console.error('[Matchmaker] Failed to join room:', error);
      throw error;
    }

    return player as RoomPlayer;
  }

  /**
   * Join a room by code
   */
  async joinByCode(code: string): Promise<{ room: MultiplayerRoom; player: RoomPlayer }> {
    const normalizedCode = code.toUpperCase().trim();

    // Find room by code
    const { data: room, error: roomError } = await db
        .from('multiplayer_rooms')
      .select('*')
      .eq('room_code', normalizedCode)
      .eq('status', 'waiting')
      .single();

    if (roomError || !room) {
      throw new Error('Room not found or already started');
    }

    // Check if room is full
    if (room.current_players >= room.max_players) {
      throw new Error('Room is full');
    }

    // Check if user is already in the room
    const { data: existingPlayer } = await db
        .from('multiplayer_room_players')
      .select('*')
      .eq('room_id', room.id)
      .eq('user_id', this.userId)
      .single();

    if (existingPlayer) {
      throw new Error('You are already in this room');
    }

    const player = await this.joinRoom(room.id);
    return { room: room as MultiplayerRoom, player };
  }

  /**
   * Leave a room
   */
  async leaveRoom(roomId: string): Promise<void> {
    // Mark player as disconnected instead of deleting
    // This preserves game history
    const { error } = await db
        .from('multiplayer_room_players')
      .update({ disconnected: true, disconnected_at: new Date().toISOString() })
      .eq('room_id', roomId)
      .eq('user_id', this.userId);

    if (error) {
      console.error('[Matchmaker] Failed to leave room:', error);
      throw error;
    }
  }

  /**
   * Cancel search and cleanup
   */
  cancelSearch(): void {
    if (this.searchAbortController) {
      this.searchAbortController.abort();
      this.searchAbortController = null;
    }
  }

  /**
   * Get a unique room code
   */
  private async getUniqueRoomCode(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const code = generateRoomCode();

      // Check if code is unique
      const { data } = await db
        .from('multiplayer_rooms')
        .select('id')
        .eq('room_code', code)
        .single();

      if (!data) {
        return code;
      }

      attempts++;
    }

    throw new Error('Failed to generate unique room code');
  }

  /**
   * Get active rooms for a game (for lobby display)
   */
  static async getActiveRooms(
    gameId: string,
    mode?: RoomMode,
    limit: number = 20
  ): Promise<MultiplayerRoom[]> {
    let query = supabase
      .from('multiplayer_rooms')
      .select('*')
      .eq('game_id', gameId)
      .eq('status', 'waiting')
      .is('room_code', null) // Only public rooms
      .order('created_at', { ascending: false })
      .limit(limit);

    if (mode) {
      query = query.eq('mode', mode);
    }

    const { data } = await query;
    return (data ?? []) as MultiplayerRoom[];
  }

  /**
   * Get room details with players
   */
  static async getRoomWithPlayers(
    roomId: string
  ): Promise<{ room: MultiplayerRoom; players: RoomPlayer[] } | null> {
    const { data: room } = await db
        .from('multiplayer_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (!room) return null;

    const { data: players } = await db
        .from('multiplayer_room_players')
      .select(`
        *,
        users (
          username,
          display_name,
          avatar_url,
          theme_color
        )
      `)
      .eq('room_id', roomId)
      .eq('disconnected', false)
      .order('player_number', { ascending: true });

    return {
      room: room as MultiplayerRoom,
      players: (players ?? []) as RoomPlayer[],
    };
  }
}

/**
 * Create a matchmaker instance
 */
export function createMatchmaker(userId: string): Matchmaker {
  return new Matchmaker(userId);
}
