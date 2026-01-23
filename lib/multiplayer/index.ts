/**
 * Multiplayer Infrastructure
 * Exports all multiplayer-related modules
 */

// Types
export * from './types';

// Realtime client
export { MultiplayerRealtimeClient, realtimeClient, getRealtimeClient } from './realtime';

// Matchmaking
export { Matchmaker, createMatchmaker, generateRoomCode } from './matchmaking';

// ELO system
export {
  calculateEloChange,
  calculateDrawEloChange,
  calculateExpectedScore,
  getKFactor,
  getOrCreateStats,
  updateStatsAfterMatch,
  getEloTier,
  getPlayerRank,
} from './elo';
