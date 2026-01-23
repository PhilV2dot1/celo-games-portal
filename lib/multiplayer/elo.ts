/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/**
 * ELO Rating System
 * Standard chess-style ELO calculation for ranked matches
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabase/client';
import { EloChange, MatchResult, MultiplayerStats } from './types';

// Type assertion helper for Supabase queries on multiplayer tables
const db = supabase as any;

// Default K-factor (how much ratings can change per game)
const DEFAULT_K_FACTOR = 32;

// K-factor adjustments based on number of games played
const K_FACTOR_PROVISIONAL = 40; // First 30 games
const K_FACTOR_ESTABLISHED = 32; // 30-100 games
const K_FACTOR_EXPERT = 24; // 100+ games

// Minimum and maximum ELO bounds
const MIN_ELO = 100;
const MAX_ELO = 3000;

/**
 * Get K-factor based on player's total games
 */
export function getKFactor(totalGames: number): number {
  if (totalGames < 30) return K_FACTOR_PROVISIONAL;
  if (totalGames < 100) return K_FACTOR_ESTABLISHED;
  return K_FACTOR_EXPERT;
}

/**
 * Calculate expected win probability
 * @param playerElo - Player's current ELO
 * @param opponentElo - Opponent's current ELO
 * @returns Expected probability of winning (0 to 1)
 */
export function calculateExpectedScore(
  playerElo: number,
  opponentElo: number
): number {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
}

/**
 * Calculate ELO changes after a match
 * @param winnerElo - Winner's current ELO
 * @param loserElo - Loser's current ELO
 * @param kFactorWinner - K-factor for winner (based on their experience)
 * @param kFactorLoser - K-factor for loser (based on their experience)
 * @returns ELO changes for both players
 */
export function calculateEloChange(
  winnerElo: number,
  loserElo: number,
  kFactorWinner: number = DEFAULT_K_FACTOR,
  kFactorLoser: number = DEFAULT_K_FACTOR
): EloChange {
  const expectedWin = calculateExpectedScore(winnerElo, loserElo);
  const expectedLoss = 1 - expectedWin;

  // Winner gains points (actual score = 1)
  const winnerGain = Math.round(kFactorWinner * (1 - expectedWin));

  // Loser loses points (actual score = 0)
  const loserLoss = Math.round(kFactorLoser * expectedLoss);

  // Calculate new ELOs with bounds
  const winnerNewElo = Math.min(MAX_ELO, Math.max(MIN_ELO, winnerElo + winnerGain));
  const loserNewElo = Math.min(MAX_ELO, Math.max(MIN_ELO, loserElo - loserLoss));

  return {
    winnerGain,
    loserLoss,
    winnerNewElo,
    loserNewElo,
  };
}

/**
 * Calculate ELO changes for a draw
 * In a draw, the lower-rated player gains and the higher-rated player loses slightly
 */
export function calculateDrawEloChange(
  player1Elo: number,
  player2Elo: number,
  kFactor1: number = DEFAULT_K_FACTOR,
  kFactor2: number = DEFAULT_K_FACTOR
): { player1Change: number; player2Change: number } {
  const expected1 = calculateExpectedScore(player1Elo, player2Elo);
  const expected2 = 1 - expected1;

  // Both players get actual score of 0.5
  const player1Change = Math.round(kFactor1 * (0.5 - expected1));
  const player2Change = Math.round(kFactor2 * (0.5 - expected2));

  return { player1Change, player2Change };
}

/**
 * Get or create player stats
 */
export async function getOrCreateStats(
  userId: string,
  gameId: string,
  mode: '1v1-ranked' | '1v1-casual'
): Promise<MultiplayerStats> {
  // Try to get existing stats
  const { data: existing } = await db
        .from('multiplayer_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('game_id', gameId)
    .eq('mode', mode)
    .single();

  if (existing) {
    return existing as MultiplayerStats;
  }

  // Create new stats
  const newStats: Partial<MultiplayerStats> = {
    user_id: userId,
    game_id: gameId,
    mode,
    wins: 0,
    losses: 0,
    draws: 0,
    elo_rating: 1000,
    highest_elo: 1000,
    lowest_elo: 1000,
    total_games: 0,
    win_streak: 0,
    best_win_streak: 0,
    loss_streak: 0,
    worst_loss_streak: 0,
  };

  const { data: created, error } = await db
        .from('multiplayer_stats')
    .insert(newStats)
    .select()
    .single();

  if (error) {
    console.error('[ELO] Failed to create stats:', error);
    throw error;
  }

  return created as MultiplayerStats;
}

/**
 * Update player stats after a match result
 */
export async function updateStatsAfterMatch(
  result: MatchResult
): Promise<{ player1Stats: MultiplayerStats; player2Stats: MultiplayerStats } | null> {
  if (result.mode !== '1v1-ranked') {
    // Only update ELO for ranked matches
    return null;
  }

  const winnerId = result.winnerId;
  const loserId = result.loserId;

  if (!winnerId && !loserId) {
    console.error('[ELO] No valid player IDs in match result');
    return null;
  }

  try {
    if (result.isDraw && winnerId && loserId) {
      // Handle draw
      const [stats1, stats2] = await Promise.all([
        getOrCreateStats(winnerId, result.gameId, result.mode),
        getOrCreateStats(loserId, result.gameId, result.mode),
      ]);

      const kFactor1 = getKFactor(stats1.total_games);
      const kFactor2 = getKFactor(stats2.total_games);

      const { player1Change, player2Change } = calculateDrawEloChange(
        stats1.elo_rating,
        stats2.elo_rating,
        kFactor1,
        kFactor2
      );

      // Update both players
      const [updated1, updated2] = await Promise.all([
        updatePlayerStats(winnerId, result.gameId, result.mode, {
          draws: stats1.draws + 1,
          total_games: stats1.total_games + 1,
          elo_rating: Math.min(MAX_ELO, Math.max(MIN_ELO, stats1.elo_rating + player1Change)),
          win_streak: 0,
          loss_streak: 0,
        }),
        updatePlayerStats(loserId, result.gameId, result.mode, {
          draws: stats2.draws + 1,
          total_games: stats2.total_games + 1,
          elo_rating: Math.min(MAX_ELO, Math.max(MIN_ELO, stats2.elo_rating + player2Change)),
          win_streak: 0,
          loss_streak: 0,
        }),
      ]);

      return { player1Stats: updated1, player2Stats: updated2 };
    }

    if (winnerId && loserId) {
      // Handle win/loss
      const [winnerStats, loserStats] = await Promise.all([
        getOrCreateStats(winnerId, result.gameId, result.mode),
        getOrCreateStats(loserId, result.gameId, result.mode),
      ]);

      const kFactorWinner = getKFactor(winnerStats.total_games);
      const kFactorLoser = getKFactor(loserStats.total_games);

      const eloChange = calculateEloChange(
        winnerStats.elo_rating,
        loserStats.elo_rating,
        kFactorWinner,
        kFactorLoser
      );

      // Calculate streaks
      const newWinStreak = winnerStats.win_streak + 1;
      const newLossStreak = loserStats.loss_streak + 1;

      // Update both players
      const [updatedWinner, updatedLoser] = await Promise.all([
        updatePlayerStats(winnerId, result.gameId, result.mode, {
          wins: winnerStats.wins + 1,
          total_games: winnerStats.total_games + 1,
          elo_rating: eloChange.winnerNewElo,
          highest_elo: Math.max(winnerStats.highest_elo, eloChange.winnerNewElo),
          win_streak: newWinStreak,
          best_win_streak: Math.max(winnerStats.best_win_streak, newWinStreak),
          loss_streak: 0,
        }),
        updatePlayerStats(loserId, result.gameId, result.mode, {
          losses: loserStats.losses + 1,
          total_games: loserStats.total_games + 1,
          elo_rating: eloChange.loserNewElo,
          lowest_elo: Math.min(loserStats.lowest_elo, eloChange.loserNewElo),
          win_streak: 0,
          loss_streak: newLossStreak,
          worst_loss_streak: Math.max(loserStats.worst_loss_streak, newLossStreak),
        }),
      ]);

      return { player1Stats: updatedWinner, player2Stats: updatedLoser };
    }

    return null;
  } catch (error) {
    console.error('[ELO] Failed to update stats:', error);
    throw error;
  }
}

/**
 * Update individual player stats
 */
async function updatePlayerStats(
  userId: string,
  gameId: string,
  mode: '1v1-ranked' | '1v1-casual',
  updates: Partial<MultiplayerStats>
): Promise<MultiplayerStats> {
  const { data, error } = await db
        .from('multiplayer_stats')
    .update(updates)
    .eq('user_id', userId)
    .eq('game_id', gameId)
    .eq('mode', mode)
    .select()
    .single();

  if (error) {
    console.error('[ELO] Failed to update player stats:', error);
    throw error;
  }

  return data as MultiplayerStats;
}

/**
 * Get ELO rating display tier
 */
export function getEloTier(elo: number): {
  name: string;
  color: string;
  icon: string;
} {
  if (elo >= 2400) return { name: 'Grandmaster', color: '#FF4500', icon: '👑' };
  if (elo >= 2200) return { name: 'Master', color: '#9400D3', icon: '💎' };
  if (elo >= 2000) return { name: 'Expert', color: '#FFD700', icon: '⭐' };
  if (elo >= 1800) return { name: 'Advanced', color: '#1E90FF', icon: '🔷' };
  if (elo >= 1600) return { name: 'Intermediate', color: '#32CD32', icon: '🟢' };
  if (elo >= 1400) return { name: 'Amateur', color: '#808080', icon: '⚪' };
  if (elo >= 1200) return { name: 'Beginner', color: '#CD853F', icon: '🟤' };
  return { name: 'Novice', color: '#A0522D', icon: '🔰' };
}

/**
 * Get ranking position for a player
 */
export async function getPlayerRank(
  userId: string,
  gameId: string,
  mode: '1v1-ranked' | '1v1-casual' = '1v1-ranked'
): Promise<number | null> {
  const { data: stats } = await db
        .from('multiplayer_stats')
    .select('elo_rating')
    .eq('user_id', userId)
    .eq('game_id', gameId)
    .eq('mode', mode)
    .single();

  if (!stats) return null;

  const { count } = await db
        .from('multiplayer_stats')
    .select('*', { count: 'exact', head: true })
    .eq('game_id', gameId)
    .eq('mode', mode)
    .gt('elo_rating', stats.elo_rating);

  return (count ?? 0) + 1;
}
