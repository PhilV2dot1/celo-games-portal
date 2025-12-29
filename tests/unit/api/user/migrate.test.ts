/**
 * Tests for POST /api/user/migrate
 *
 * This route migrates localStorage game stats to the database by:
 * 1. Creating a new user (if not exists)
 * 2. Creating synthetic game sessions from local stats
 * 3. Preserving total points earned
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/user/migrate/route';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '@/lib/supabase/client';

const mockFrom = supabase.from as ReturnType<typeof vi.fn>;

describe('POST /api/user/migrate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================
  // SUCCESS CASES
  // ============================================================

  describe('Success Cases', () => {
    it('should successfully migrate user with fid', async () => {
      const localStats = {
        'tic-tac-toe': {
          played: 10,
          wins: 7,
          losses: 3,
          totalPoints: 100,
        },
        jackpot: {
          played: 5,
          wins: 2,
          losses: 3,
          totalPoints: 50,
        },
      };

      // Mock user doesn't exist
      const checkUserChain: any = {
        select: vi.fn(() => checkUserChain),
        eq: vi.fn(() => checkUserChain),
        maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      };

      // Mock user creation
      const createUserChain: any = {
        insert: vi.fn(() => createUserChain),
        select: vi.fn(() => createUserChain),
        single: vi.fn().mockResolvedValue({
          data: { id: 'new-user-123' },
          error: null,
        }),
      };

      // Mock session insertion
      const sessionsChain: any = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };

      mockFrom
        .mockReturnValueOnce(checkUserChain) // Check if user exists
        .mockReturnValueOnce(createUserChain) // Create user
        .mockReturnValueOnce(sessionsChain); // Insert sessions

      const request = new Request('http://localhost/api/user/migrate', {
        method: 'POST',
        body: JSON.stringify({
          fid: 12345,
          localStats,
          totalPoints: 150,
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        message: 'Migration completed successfully',
        userId: 'new-user-123',
        sessionsMigrated: 15, // tic-tac-toe: 7+3=10, jackpot: 2+3=5, total: 15
        totalPoints: 150,
      });

      // Verify user check
      expect(checkUserChain.eq).toHaveBeenCalledWith('fid', 12345);

      // Verify user creation
      expect(createUserChain.insert).toHaveBeenCalledWith({
        fid: 12345,
        wallet_address: undefined,
        total_points: 150,
      });

      // Verify sessions were created (12 total: 9 wins + 3 losses)
      expect(sessionsChain.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            user_id: 'new-user-123',
            game_id: 'tic-tac-toe',
            result: 'win',
            mode: 'free',
            points_earned: 10, // 100 / 10 played
          }),
        ])
      );
    });

    it('should successfully migrate user with wallet address', async () => {
      const localStats = {
        blackjack: {
          played: 20,
          wins: 15,
          losses: 5,
          totalPoints: 200,
        },
      };

      const checkUserChain: any = {
        select: vi.fn(() => checkUserChain),
        eq: vi.fn(() => checkUserChain),
        maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      };

      const createUserChain: any = {
        insert: vi.fn(() => createUserChain),
        select: vi.fn(() => createUserChain),
        single: vi.fn().mockResolvedValue({
          data: { id: 'wallet-user-456' },
          error: null,
        }),
      };

      const sessionsChain: any = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };

      mockFrom
        .mockReturnValueOnce(checkUserChain)
        .mockReturnValueOnce(createUserChain)
        .mockReturnValueOnce(sessionsChain);

      const request = new Request('http://localhost/api/user/migrate', {
        method: 'POST',
        body: JSON.stringify({
          walletAddress: '0xabc123',
          localStats,
          totalPoints: 200,
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.userId).toBe('wallet-user-456');
      expect(data.sessionsMigrated).toBe(20); // 15 wins + 5 losses

      // Verify checked by wallet address
      expect(checkUserChain.eq).toHaveBeenCalledWith('wallet_address', '0xabc123');

      // Verify user created with wallet
      expect(createUserChain.insert).toHaveBeenCalledWith({
        fid: undefined,
        wallet_address: '0xabc123',
        total_points: 200,
      });
    });

    it('should migrate user with both fid and wallet address', async () => {
      const localStats = {
        rps: {
          played: 8,
          wins: 4,
          losses: 4,
          totalPoints: 80,
        },
      };

      const checkUserChain: any = {
        select: vi.fn(() => checkUserChain),
        eq: vi.fn(() => checkUserChain),
        maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      };

      const createUserChain: any = {
        insert: vi.fn(() => createUserChain),
        select: vi.fn(() => createUserChain),
        single: vi.fn().mockResolvedValue({
          data: { id: 'both-user-789' },
          error: null,
        }),
      };

      const sessionsChain: any = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };

      mockFrom
        .mockReturnValueOnce(checkUserChain)
        .mockReturnValueOnce(createUserChain)
        .mockReturnValueOnce(sessionsChain);

      const request = new Request('http://localhost/api/user/migrate', {
        method: 'POST',
        body: JSON.stringify({
          fid: 99999,
          walletAddress: '0xdef456',
          localStats,
          totalPoints: 80,
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sessionsMigrated).toBe(8);

      // Should check by fid first (when both provided)
      expect(checkUserChain.eq).toHaveBeenCalledWith('fid', 99999);

      // Should create with both fid and wallet
      expect(createUserChain.insert).toHaveBeenCalledWith({
        fid: 99999,
        wallet_address: '0xdef456',
        total_points: 80,
      });
    });

    it('should handle migration with zero points for losses', async () => {
      const localStats = {
        mastermind: {
          played: 6,
          wins: 3,
          losses: 3,
          totalPoints: 60,
        },
      };

      const checkUserChain: any = {
        select: vi.fn(() => checkUserChain),
        eq: vi.fn(() => checkUserChain),
        maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      };

      const createUserChain: any = {
        insert: vi.fn(() => createUserChain),
        select: vi.fn(() => createUserChain),
        single: vi.fn().mockResolvedValue({
          data: { id: 'user-losses' },
          error: null,
        }),
      };

      const sessionsChain: any = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };

      mockFrom
        .mockReturnValueOnce(checkUserChain)
        .mockReturnValueOnce(createUserChain)
        .mockReturnValueOnce(sessionsChain);

      const request = new Request('http://localhost/api/user/migrate', {
        method: 'POST',
        body: JSON.stringify({
          fid: 11111,
          localStats,
          totalPoints: 60,
        }),
      });

      await POST(request as any);

      const insertedSessions = sessionsChain.insert.mock.calls[0][0];

      // Check that losses have 0 points
      const losses = insertedSessions.filter((s: any) => s.result === 'lose');
      expect(losses).toHaveLength(3);
      losses.forEach((loss: any) => {
        expect(loss.points_earned).toBe(0);
      });

      // Check that wins have distributed points
      const wins = insertedSessions.filter((s: any) => s.result === 'win');
      expect(wins).toHaveLength(3);
      wins.forEach((win: any) => {
        expect(win.points_earned).toBe(10); // 60 / 6 played
      });
    });

    it('should handle empty sessions gracefully', async () => {
      // User with minimal points but no games (edge case)
      const localStats = {};

      const checkUserChain: any = {
        select: vi.fn(() => checkUserChain),
        eq: vi.fn(() => checkUserChain),
        maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      };

      const createUserChain: any = {
        insert: vi.fn(() => createUserChain),
        select: vi.fn(() => createUserChain),
        single: vi.fn().mockResolvedValue({
          data: { id: 'user-empty' },
          error: null,
        }),
      };

      mockFrom
        .mockReturnValueOnce(checkUserChain)
        .mockReturnValueOnce(createUserChain);
      // No sessions chain - shouldn't be called

      const request = new Request('http://localhost/api/user/migrate', {
        method: 'POST',
        body: JSON.stringify({
          fid: 22222,
          localStats,
          totalPoints: 1, // Minimal non-zero points
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sessionsMigrated).toBe(0);
      expect(data.totalPoints).toBe(1);

      // Should only call from() twice (check + create), not for sessions
      expect(mockFrom).toHaveBeenCalledTimes(2);
    });
  });

  // ============================================================
  // VALIDATION ERRORS
  // ============================================================

  describe('Validation Errors', () => {
    it('should return 400 when localStats is missing', async () => {
      const request = new Request('http://localhost/api/user/migrate', {
        method: 'POST',
        body: JSON.stringify({
          fid: 12345,
          totalPoints: 100,
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields: localStats, totalPoints');
    });

    it('should return 400 when totalPoints is missing', async () => {
      const request = new Request('http://localhost/api/user/migrate', {
        method: 'POST',
        body: JSON.stringify({
          fid: 12345,
          localStats: {},
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields: localStats, totalPoints');
    });

    it('should return 400 when both fid and walletAddress are missing', async () => {
      const request = new Request('http://localhost/api/user/migrate', {
        method: 'POST',
        body: JSON.stringify({
          localStats: { 'tic-tac-toe': { played: 1, wins: 1, losses: 0, totalPoints: 10 } },
          totalPoints: 10,
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Either fid or walletAddress is required');
    });

    it('should return 400 when user already exists with fid', async () => {
      const checkUserChain: any = {
        select: vi.fn(() => checkUserChain),
        eq: vi.fn(() => checkUserChain),
        maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'existing-user-123' } }),
      };

      mockFrom.mockReturnValueOnce(checkUserChain);

      const request = new Request('http://localhost/api/user/migrate', {
        method: 'POST',
        body: JSON.stringify({
          fid: 12345,
          localStats: { jackpot: { played: 1, wins: 1, losses: 0, totalPoints: 10 } },
          totalPoints: 10,
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('User already exists in database. Migration not needed.');
      expect(data.userId).toBe('existing-user-123');
    });

    it('should return 400 when user already exists with wallet address', async () => {
      const checkUserChain: any = {
        select: vi.fn(() => checkUserChain),
        eq: vi.fn(() => checkUserChain),
        maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'existing-wallet-user' } }),
      };

      mockFrom.mockReturnValueOnce(checkUserChain);

      const request = new Request('http://localhost/api/user/migrate', {
        method: 'POST',
        body: JSON.stringify({
          walletAddress: '0xexisting',
          localStats: { rps: { played: 1, wins: 1, losses: 0, totalPoints: 10 } },
          totalPoints: 10,
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('User already exists in database. Migration not needed.');
      expect(data.userId).toBe('existing-wallet-user');
    });
  });

  // ============================================================
  // ERROR HANDLING
  // ============================================================

  describe('Error Handling', () => {
    it('should return 500 when user creation fails', async () => {
      const checkUserChain: any = {
        select: vi.fn(() => checkUserChain),
        eq: vi.fn(() => checkUserChain),
        maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      };

      const createUserChain: any = {
        insert: vi.fn(() => createUserChain),
        select: vi.fn(() => createUserChain),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      };

      mockFrom
        .mockReturnValueOnce(checkUserChain)
        .mockReturnValueOnce(createUserChain);

      const request = new Request('http://localhost/api/user/migrate', {
        method: 'POST',
        body: JSON.stringify({
          fid: 12345,
          localStats: { jackpot: { played: 1, wins: 1, losses: 0, totalPoints: 10 } },
          totalPoints: 10,
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create user');
      expect(data.details).toBeDefined();
    });

    it('should succeed even when session insertion fails', async () => {
      const checkUserChain: any = {
        select: vi.fn(() => checkUserChain),
        eq: vi.fn(() => checkUserChain),
        maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      };

      const createUserChain: any = {
        insert: vi.fn(() => createUserChain),
        select: vi.fn(() => createUserChain),
        single: vi.fn().mockResolvedValue({
          data: { id: 'user-session-fail' },
          error: null,
        }),
      };

      const sessionsChain: any = {
        insert: vi.fn().mockResolvedValue({ error: { message: 'Session insert failed' } }),
      };

      mockFrom
        .mockReturnValueOnce(checkUserChain)
        .mockReturnValueOnce(createUserChain)
        .mockReturnValueOnce(sessionsChain);

      const request = new Request('http://localhost/api/user/migrate', {
        method: 'POST',
        body: JSON.stringify({
          fid: 33333,
          localStats: { '2048': { played: 5, wins: 3, losses: 2, totalPoints: 50 } },
          totalPoints: 50,
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      // Should still succeed despite session failure
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.userId).toBe('user-session-fail');
      expect(data.sessionsMigrated).toBe(5); // Still reports what was attempted
    });

    it('should return 500 when JSON parsing fails', async () => {
      const request = new Request('http://localhost/api/user/migrate', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(data.details).toBeDefined();
    });
  });

  // ============================================================
  // EDGE CASES
  // ============================================================

  describe('Edge Cases', () => {
    it('should handle multiple games in localStats', async () => {
      const localStats = {
        'tic-tac-toe': { played: 5, wins: 3, losses: 2, totalPoints: 50 },
        jackpot: { played: 3, wins: 1, losses: 2, totalPoints: 30 },
        blackjack: { played: 10, wins: 7, losses: 3, totalPoints: 100 },
        rps: { played: 4, wins: 2, losses: 2, totalPoints: 40 },
      };

      const checkUserChain: any = {
        select: vi.fn(() => checkUserChain),
        eq: vi.fn(() => checkUserChain),
        maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      };

      const createUserChain: any = {
        insert: vi.fn(() => createUserChain),
        select: vi.fn(() => createUserChain),
        single: vi.fn().mockResolvedValue({
          data: { id: 'multi-game-user' },
          error: null,
        }),
      };

      const sessionsChain: any = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };

      mockFrom
        .mockReturnValueOnce(checkUserChain)
        .mockReturnValueOnce(createUserChain)
        .mockReturnValueOnce(sessionsChain);

      const request = new Request('http://localhost/api/user/migrate', {
        method: 'POST',
        body: JSON.stringify({
          fid: 44444,
          localStats,
          totalPoints: 220,
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sessionsMigrated).toBe(22); // 3+2+1+2+7+3+2+2 = 22

      // Verify all games are included
      const insertedSessions = sessionsChain.insert.mock.calls[0][0];
      const gameIds = [...new Set(insertedSessions.map((s: any) => s.game_id))];
      expect(gameIds).toHaveLength(4);
      expect(gameIds).toContain('tic-tac-toe');
      expect(gameIds).toContain('jackpot');
      expect(gameIds).toContain('blackjack');
      expect(gameIds).toContain('rps');
    });

    it('should distribute points correctly based on played count', async () => {
      const localStats = {
        jackpot: {
          played: 8,
          wins: 5,
          losses: 3,
          totalPoints: 160, // 160 / 8 = 20 points per game
        },
      };

      const checkUserChain: any = {
        select: vi.fn(() => checkUserChain),
        eq: vi.fn(() => checkUserChain),
        maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      };

      const createUserChain: any = {
        insert: vi.fn(() => createUserChain),
        select: vi.fn(() => createUserChain),
        single: vi.fn().mockResolvedValue({
          data: { id: 'points-dist-user' },
          error: null,
        }),
      };

      const sessionsChain: any = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };

      mockFrom
        .mockReturnValueOnce(checkUserChain)
        .mockReturnValueOnce(createUserChain)
        .mockReturnValueOnce(sessionsChain);

      const request = new Request('http://localhost/api/user/migrate', {
        method: 'POST',
        body: JSON.stringify({
          fid: 55555,
          localStats,
          totalPoints: 160,
        }),
      });

      await POST(request as any);

      const insertedSessions = sessionsChain.insert.mock.calls[0][0];
      const wins = insertedSessions.filter((s: any) => s.result === 'win');

      // Each win should have 20 points (160 / 8)
      wins.forEach((win: any) => {
        expect(win.points_earned).toBe(20);
      });
    });

    it('should set all sessions to free mode', async () => {
      const localStats = {
        mastermind: { played: 4, wins: 2, losses: 2, totalPoints: 40 },
      };

      const checkUserChain: any = {
        select: vi.fn(() => checkUserChain),
        eq: vi.fn(() => checkUserChain),
        maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      };

      const createUserChain: any = {
        insert: vi.fn(() => createUserChain),
        select: vi.fn(() => createUserChain),
        single: vi.fn().mockResolvedValue({
          data: { id: 'mode-user' },
          error: null,
        }),
      };

      const sessionsChain: any = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };

      mockFrom
        .mockReturnValueOnce(checkUserChain)
        .mockReturnValueOnce(createUserChain)
        .mockReturnValueOnce(sessionsChain);

      const request = new Request('http://localhost/api/user/migrate', {
        method: 'POST',
        body: JSON.stringify({
          fid: 66666,
          localStats,
          totalPoints: 40,
        }),
      });

      await POST(request as any);

      const insertedSessions = sessionsChain.insert.mock.calls[0][0];

      // All sessions should be 'free' mode
      insertedSessions.forEach((session: any) => {
        expect(session.mode).toBe('free');
      });
    });
  });
});
