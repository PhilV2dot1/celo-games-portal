export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          fid: number | null
          username: string | null
          wallet_address: string | null
          total_points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          fid?: number | null
          username?: string | null
          wallet_address?: string | null
          total_points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          fid?: number | null
          username?: string | null
          wallet_address?: string | null
          total_points?: number
          created_at?: string
          updated_at?: string
        }
      }
      games: {
        Row: {
          id: string
          name: string
          description: string
          contract_address: string | null
          icon: string
          created_at: string
        }
        Insert: {
          id: string
          name: string
          description: string
          contract_address?: string | null
          icon: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          contract_address?: string | null
          icon?: string
          created_at?: string
        }
      }
      game_sessions: {
        Row: {
          id: string
          user_id: string
          game_id: string
          mode: 'free' | 'onchain'
          result: 'win' | 'lose' | 'draw' | 'push'
          points_earned: number
          tx_hash: string | null
          played_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_id: string
          mode: 'free' | 'onchain'
          result: 'win' | 'lose' | 'draw' | 'push'
          points_earned: number
          tx_hash?: string | null
          played_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_id?: string
          mode?: 'free' | 'onchain'
          result?: 'win' | 'lose' | 'draw' | 'push'
          points_earned?: number
          tx_hash?: string | null
          played_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          category: string
          requirement: Json
          points: number
          created_at: string
        }
        Insert: {
          id: string
          name: string
          description: string
          icon: string
          category: string
          requirement: Json
          points: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          category?: string
          requirement?: Json
          points?: number
          created_at?: string
        }
      }
      user_badges: {
        Row: {
          user_id: string
          badge_id: string
          earned_at: string
        }
        Insert: {
          user_id: string
          badge_id: string
          earned_at?: string
        }
        Update: {
          user_id?: string
          badge_id?: string
          earned_at?: string
        }
      }
      // Multiplayer Tables
      multiplayer_rooms: {
        Row: {
          id: string
          game_id: string
          mode: '1v1-ranked' | '1v1-casual' | 'collaborative'
          status: 'waiting' | 'playing' | 'finished' | 'cancelled'
          max_players: number
          current_players: number
          room_code: string | null
          created_by: string | null
          created_at: string
          started_at: string | null
          finished_at: string | null
          winner_id: string | null
          game_state: Json
        }
        Insert: {
          id?: string
          game_id: string
          mode: '1v1-ranked' | '1v1-casual' | 'collaborative'
          status?: 'waiting' | 'playing' | 'finished' | 'cancelled'
          max_players?: number
          current_players?: number
          room_code?: string | null
          created_by?: string | null
          created_at?: string
          started_at?: string | null
          finished_at?: string | null
          winner_id?: string | null
          game_state?: Json
        }
        Update: {
          id?: string
          game_id?: string
          mode?: '1v1-ranked' | '1v1-casual' | 'collaborative'
          status?: 'waiting' | 'playing' | 'finished' | 'cancelled'
          max_players?: number
          current_players?: number
          room_code?: string | null
          created_by?: string | null
          created_at?: string
          started_at?: string | null
          finished_at?: string | null
          winner_id?: string | null
          game_state?: Json
        }
      }
      multiplayer_room_players: {
        Row: {
          room_id: string
          user_id: string
          player_number: number
          joined_at: string
          ready: boolean
          disconnected: boolean
          disconnected_at: string | null
        }
        Insert: {
          room_id: string
          user_id: string
          player_number: number
          joined_at?: string
          ready?: boolean
          disconnected?: boolean
          disconnected_at?: string | null
        }
        Update: {
          room_id?: string
          user_id?: string
          player_number?: number
          joined_at?: string
          ready?: boolean
          disconnected?: boolean
          disconnected_at?: string | null
        }
      }
      multiplayer_actions: {
        Row: {
          id: string
          room_id: string
          user_id: string | null
          action_type: string
          action_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id?: string | null
          action_type: string
          action_data: Json
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string | null
          action_type?: string
          action_data?: Json
          created_at?: string
        }
      }
      multiplayer_stats: {
        Row: {
          user_id: string
          game_id: string
          mode: '1v1-ranked' | '1v1-casual'
          wins: number
          losses: number
          draws: number
          elo_rating: number
          highest_elo: number
          lowest_elo: number
          total_games: number
          win_streak: number
          best_win_streak: number
          loss_streak: number
          worst_loss_streak: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          game_id: string
          mode: '1v1-ranked' | '1v1-casual'
          wins?: number
          losses?: number
          draws?: number
          elo_rating?: number
          highest_elo?: number
          lowest_elo?: number
          total_games?: number
          win_streak?: number
          best_win_streak?: number
          loss_streak?: number
          worst_loss_streak?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          game_id?: string
          mode?: '1v1-ranked' | '1v1-casual'
          wins?: number
          losses?: number
          draws?: number
          elo_rating?: number
          highest_elo?: number
          lowest_elo?: number
          total_games?: number
          win_streak?: number
          best_win_streak?: number
          loss_streak?: number
          worst_loss_streak?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      leaderboard: {
        Row: {
          user_id: string
          username: string | null
          fid: number | null
          total_points: number
          games_played: number
          wins: number
          rank: number
        }
      }
    }
    Functions: {
      get_game_leaderboard: {
        Args: {
          p_game_id: string
          p_limit: number
        }
        Returns: Array<{
          user_id: string
          username: string | null
          fid: number | null
          game_points: number
          games_played: number
          wins: number
          rank: number
        }>
      }
    }
  }
}
