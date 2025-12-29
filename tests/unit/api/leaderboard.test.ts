/**
 * Tests for Leaderboard API Routes
 *
 * Covers:
 * - GET /api/leaderboard/game/[gameId] - Per-game leaderboards
 * - POST /api/leaderboard/refresh - Refresh materialized view
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '@/app/api/leaderboard/game/[gameId]/route';
import { POST } from '@/app/api/leaderboard/refresh/route';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

// Mock createClient for refresh route
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

import { supabase } from '@/lib/supabase/client';
import { createClient } from '@supabase/supabase-js';

const mockSupabaseRpc = supabase.rpc as ReturnType<typeof vi.fn>;
const mockCreateClient = createClient as ReturnType<typeof vi.fn>;

// Helper to create Next.js-style request with nextUrl
function createNextRequest(url: string) {
  const request = new Request(url);
  const nextUrl = new URL(url);
  return Object.assign(request, { nextUrl });
}

describe('Leaderboard API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================
  // GET /api/leaderboard/game/[gameId]
  // ============================================================

  describe('GET /api/leaderboard/game/[gameId]', () => {
    describe('Success Cases', () => {
      it('should return formatted leaderboard for valid game', async () => {
        const mockLeaderboard = [
          {
            rank: 1,
            user_id: 'user-1',
            username: 'player1',
            display_name: 'Pro Player',
            fid: 12345,
            avatar_type: 'custom',
            avatar_url: 'https://example.com/avatar.png',
            theme_color: 'blue',
            game_points: 1000,
            games_played: 50,
            wins: 40,
          },
          {
            rank: 2,
            user_id: 'user-2',
            username: 'player2',
            display_name: null,
            fid: null,
            avatar_type: null,
            avatar_url: null,
            theme_color: null,
            game_points: 800,
            games_played: 40,
            wins: 30,
          },
        ];

        mockSupabaseRpc.mockResolvedValue({ data: mockLeaderboard, error: null });

        const request = createNextRequest('http://localhost/api/leaderboard/game/tic-tac-toe');
        const response = await GET(request as any, { params: { gameId: 'tic-tac-toe' as any } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({
          gameId: 'tic-tac-toe',
          count: 2,
          leaderboard: [
            {
              rank: 1,
              userId: 'user-1',
              username: 'player1',
              displayName: 'Pro Player',
              fid: 12345,
              avatarType: 'custom',
              avatarUrl: 'https://example.com/avatar.png',
              themeColor: 'blue',
              gamePoints: 1000,
              gamesPlayed: 50,
              wins: 40,
            },
            {
              rank: 2,
              userId: 'user-2',
              username: 'player2',
              displayName: 'player2',
              fid: null,
              avatarType: null,
              avatarUrl: null,
              themeColor: 'yellow', // default
              gamePoints: 800,
              gamesPlayed: 40,
              wins: 30,
            },
          ],
        });

        expect(mockSupabaseRpc).toHaveBeenCalledWith('get_game_leaderboard', {
          p_game_id: 'tic-tac-toe',
          p_limit: 100, // default
        });
      });

      it('should use custom limit parameter', async () => {
        mockSupabaseRpc.mockResolvedValue({ data: [], error: null });

        const request = createNextRequest('http://localhost/api/leaderboard/game/jackpot?limit=10');
        await GET(request as any, { params: { gameId: 'jackpot' as any } });

        expect(mockSupabaseRpc).toHaveBeenCalledWith('get_game_leaderboard', {
          p_game_id: 'jackpot',
          p_limit: 10,
        });
      });

      it('should use default limit=100 when not provided', async () => {
        mockSupabaseRpc.mockResolvedValue({ data: [], error: null });

        const request = createNextRequest('http://localhost/api/leaderboard/game/blackjack');
        await GET(request as any, { params: { gameId: 'blackjack' as any } });

        expect(mockSupabaseRpc).toHaveBeenCalledWith('get_game_leaderboard', {
          p_game_id: 'blackjack',
          p_limit: 100,
        });
      });

      it('should handle empty leaderboard', async () => {
        mockSupabaseRpc.mockResolvedValue({ data: [], error: null });

        const request = createNextRequest('http://localhost/api/leaderboard/game/mastermind');
        const response = await GET(request as any, { params: { gameId: 'mastermind' as any } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({
          gameId: 'mastermind',
          count: 0,
          leaderboard: [],
        });
      });
    });

    describe('Default Values', () => {
      it('should use fid for username when username is null', async () => {
        const mockEntry = {
          rank: 1,
          user_id: 'user-1',
          username: null,
          display_name: null,
          fid: 99999,
          avatar_type: null,
          avatar_url: null,
          theme_color: null,
          game_points: 500,
          games_played: 10,
          wins: 5,
        };

        mockSupabaseRpc.mockResolvedValue({ data: [mockEntry], error: null });

        const request = createNextRequest('http://localhost/api/leaderboard/game/rps');
        const response = await GET(request as any, { params: { gameId: 'rps' as any } });
        const data = await response.json();

        expect(data.leaderboard[0].username).toBe('Player 99999');
        expect(data.leaderboard[0].displayName).toBe('Player 99999');
      });

      it('should use "Player Unknown" when both username and fid are null', async () => {
        const mockEntry = {
          rank: 1,
          user_id: 'user-anon',
          username: null,
          display_name: null,
          fid: null,
          avatar_type: null,
          avatar_url: null,
          theme_color: null,
          game_points: 100,
          games_played: 5,
          wins: 2,
        };

        mockSupabaseRpc.mockResolvedValue({ data: [mockEntry], error: null });

        const request = createNextRequest('http://localhost/api/leaderboard/game/2048');
        const response = await GET(request as any, { params: { gameId: '2048' as any } });
        const data = await response.json();

        expect(data.leaderboard[0].username).toBe('Player Unknown');
        expect(data.leaderboard[0].displayName).toBe('Player Unknown');
      });

      it('should use default theme color "yellow" when null', async () => {
        const mockEntry = {
          rank: 1,
          user_id: 'user-1',
          username: 'player1',
          display_name: 'Player 1',
          fid: null,
          avatar_type: null,
          avatar_url: null,
          theme_color: null,
          game_points: 200,
          games_played: 10,
          wins: 5,
        };

        mockSupabaseRpc.mockResolvedValue({ data: [mockEntry], error: null });

        const request = createNextRequest('http://localhost/api/leaderboard/game/tic-tac-toe');
        const response = await GET(request as any, { params: { gameId: 'tic-tac-toe' as any } });
        const data = await response.json();

        expect(data.leaderboard[0].themeColor).toBe('yellow');
      });

      it('should prefer displayName over username when both exist', async () => {
        const mockEntry = {
          rank: 1,
          user_id: 'user-1',
          username: 'username123',
          display_name: 'Cool Display Name',
          fid: null,
          avatar_type: null,
          avatar_url: null,
          theme_color: null,
          game_points: 300,
          games_played: 15,
          wins: 10,
        };

        mockSupabaseRpc.mockResolvedValue({ data: [mockEntry], error: null });

        const request = createNextRequest('http://localhost/api/leaderboard/game/jackpot');
        const response = await GET(request as any, { params: { gameId: 'jackpot' as any } });
        const data = await response.json();

        expect(data.leaderboard[0].displayName).toBe('Cool Display Name');
        expect(data.leaderboard[0].username).toBe('username123'); // still preserved
      });
    });

    describe('Error Handling', () => {
      it('should return 500 when RPC call fails', async () => {
        mockSupabaseRpc.mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' },
        });

        const request = createNextRequest('http://localhost/api/leaderboard/game/tic-tac-toe');
        const response = await GET(request as any, { params: { gameId: 'tic-tac-toe' as any } });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to fetch game leaderboard');
        expect(data.details).toBeDefined();
      });

      it('should return 500 when RPC throws exception', async () => {
        mockSupabaseRpc.mockRejectedValue(new Error('RPC exception'));

        const request = createNextRequest('http://localhost/api/leaderboard/game/jackpot');
        const response = await GET(request as any, { params: { gameId: 'jackpot' as any } });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Internal server error');
        expect(data.details).toBeDefined();
      });
    });

    describe('Edge Cases', () => {
      it('should handle large limit parameter', async () => {
        mockSupabaseRpc.mockResolvedValue({ data: [], error: null });

        const request = createNextRequest('http://localhost/api/leaderboard/game/tic-tac-toe?limit=1000');
        await GET(request as any, { params: { gameId: 'tic-tac-toe' as any } });

        expect(mockSupabaseRpc).toHaveBeenCalledWith('get_game_leaderboard', {
          p_game_id: 'tic-tac-toe',
          p_limit: 1000,
        });
      });

      it('should handle invalid limit parameter (non-numeric)', async () => {
        mockSupabaseRpc.mockResolvedValue({ data: [], error: null });

        const request = createNextRequest('http://localhost/api/leaderboard/game/jackpot?limit=invalid');
        await GET(request as any, { params: { gameId: 'jackpot' as any } });

        // parseInt('invalid') = NaN
        expect(mockSupabaseRpc).toHaveBeenCalledWith('get_game_leaderboard', {
          p_game_id: 'jackpot',
          p_limit: NaN,
        });
      });

      it('should handle zero limit', async () => {
        mockSupabaseRpc.mockResolvedValue({ data: [], error: null });

        const request = createNextRequest('http://localhost/api/leaderboard/game/blackjack?limit=0');
        await GET(request as any, { params: { gameId: 'blackjack' as any } });

        expect(mockSupabaseRpc).toHaveBeenCalledWith('get_game_leaderboard', {
          p_game_id: 'blackjack',
          p_limit: 0,
        });
      });

      it('should handle all valid game IDs', async () => {
        const validGameIds = ['tic-tac-toe', 'jackpot', 'blackjack', 'mastermind', 'rps', '2048'];
        mockSupabaseRpc.mockResolvedValue({ data: [], error: null });

        for (const gameId of validGameIds) {
          const request = createNextRequest(`http://localhost/api/leaderboard/game/${gameId}`);
          const response = await GET(request as any, { params: { gameId: gameId as any } });
          const data = await response.json();

          expect(response.status).toBe(200);
          expect(data.gameId).toBe(gameId);
        }
      });
    });
  });

  // ============================================================
  // POST /api/leaderboard/refresh
  // ============================================================

  describe('POST /api/leaderboard/refresh', () => {
    let mockAdminClient: any;

    beforeEach(() => {
      // Create chainable mock for from() queries
      const createChainableMock = () => {
        const chain: any = {
          select: vi.fn(() => chain),
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        };
        return chain;
      };

      mockAdminClient = {
        rpc: vi.fn(),
        from: vi.fn(() => createChainableMock()),
      };

      mockCreateClient.mockReturnValue(mockAdminClient);
    });

    describe('Success Cases', () => {
      it('should refresh leaderboard using RPC when available', async () => {
        mockAdminClient.rpc.mockResolvedValue({ error: null });

        const response = await POST();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toBe('Leaderboard materialized view refreshed successfully');

        expect(mockAdminClient.rpc).toHaveBeenCalledWith('refresh_leaderboard');
        expect(mockAdminClient.from).not.toHaveBeenCalled(); // RPC succeeded, no fallback
      });

      it('should fall back to query when RPC is not available', async () => {
        mockAdminClient.rpc.mockResolvedValue({
          error: { message: 'function refresh_leaderboard does not exist' },
        });

        const response = await POST();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toContain('Leaderboard queried successfully');
        expect(data.message).toContain('Materialized view auto-refreshes via triggers');
        expect(data.note).toContain('REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard');

        expect(mockAdminClient.rpc).toHaveBeenCalled();
        expect(mockAdminClient.from).toHaveBeenCalledWith('leaderboard');
      });

      it('should create admin client with service role key', async () => {
        mockAdminClient.rpc.mockResolvedValue({ error: null });

        await POST();

        expect(mockCreateClient).toHaveBeenCalledWith(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
            },
          }
        );
      });
    });

    describe('Error Handling', () => {
      it('should return 500 when both RPC and query fail', async () => {
        mockAdminClient.rpc.mockResolvedValue({
          error: { message: 'RPC failed' },
        });

        const failingChain: any = {
          select: vi.fn(() => failingChain),
          limit: vi.fn(() =>
            Promise.resolve({
              data: null,
              error: { message: 'Query failed' },
            })
          ),
        };

        mockAdminClient.from.mockReturnValue(failingChain);

        const response = await POST();
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Leaderboard view not accessible');
        expect(data.note).toContain('manually refreshed in Supabase SQL Editor');
      });

      it('should return 500 when createClient throws', async () => {
        mockCreateClient.mockImplementation(() => {
          throw new Error('Connection failed');
        });

        const response = await POST();
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Internal server error');
        expect(data.details).toBeDefined();
      });

      it('should return 500 when RPC throws exception', async () => {
        mockAdminClient.rpc.mockRejectedValue(new Error('RPC exception'));

        const response = await POST();
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Internal server error');
      });
    });

    describe('Fallback Behavior', () => {
      it('should query leaderboard table with count column', async () => {
        mockAdminClient.rpc.mockResolvedValue({
          error: { message: 'RPC not available' },
        });

        const mockChain: any = {
          select: vi.fn(() => mockChain),
          limit: vi.fn(() => Promise.resolve({ data: [{ count: 100 }], error: null })),
        };

        mockAdminClient.from.mockReturnValue(mockChain);

        await POST();

        expect(mockChain.select).toHaveBeenCalledWith('count');
        expect(mockChain.limit).toHaveBeenCalledWith(1);
      });

      it('should include helpful note in fallback response', async () => {
        mockAdminClient.rpc.mockResolvedValue({
          error: { message: 'RPC failed' },
        });

        const response = await POST();
        const data = await response.json();

        expect(data.note).toContain('REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard');
      });
    });
  });
});
