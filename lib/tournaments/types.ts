/**
 * Tournament System Types
 * Types for tournament brackets, matches, and participants
 */

// ============================================
// TOURNAMENT TYPES
// ============================================

export type TournamentStatus = 'registration' | 'in_progress' | 'completed' | 'cancelled';
export type TournamentFormat = 'single_elimination';
export type TournamentMatchStatus = 'pending' | 'playing' | 'completed' | 'bye';

export interface Tournament {
  id: string;
  game_id: string;
  name: string;
  status: TournamentStatus;
  format: TournamentFormat;
  max_players: number;
  current_players: number;
  created_by: string;
  starts_at: string | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  winner_id: string | null;
  prize_points: number;
}

export interface TournamentParticipant {
  tournament_id: string;
  user_id: string;
  seed: number;
  eliminated: boolean;
  final_position: number | null;
  joined_at: string;
  // Joined from users table
  username?: string;
  display_name?: string;
  avatar_url?: string;
}

export interface TournamentMatch {
  id: string;
  tournament_id: string;
  round: number;
  match_number: number;
  player1_id: string | null;
  player2_id: string | null;
  winner_id: string | null;
  room_id: string | null;
  status: TournamentMatchStatus;
  scheduled_at: string | null;
  // Joined from users table
  player1_username?: string;
  player2_username?: string;
  winner_username?: string;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface CreateTournamentBody {
  userId: string;
  gameId: string;
  name: string;
  maxPlayers: number;
  startsAt?: string;
  prizePoints?: number;
}

export interface JoinTournamentBody {
  userId: string;
}

export interface AdvanceMatchBody {
  matchId: string;
  winnerId: string;
}

export interface TournamentDetailResponse {
  tournament: Tournament;
  participants: TournamentParticipant[];
  matches: TournamentMatch[];
}

export interface TournamentListResponse {
  tournaments: (Tournament & { participants_count?: number })[];
  count: number;
}

// ============================================
// BRACKET TYPES
// ============================================

export interface BracketMatch {
  round: number;
  matchNumber: number;
  player1Seed: number | null;
  player2Seed: number | null;
}

export interface BracketRound {
  round: number;
  label: string;
  matches: BracketMatch[];
}
