/**
 * Social System Types
 * Types for friends, friend requests, and social features
 */

// ============================================
// FRIENDSHIP TYPES
// ============================================

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
}

export interface FriendWithProfile {
  friendship_id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  total_points: number;
  status: FriendshipStatus;
  is_requester: boolean;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface SendFriendRequestBody {
  userId: string;
  friendUsername: string;
}

export interface FriendActionBody {
  action: 'accept' | 'block';
}

export interface FriendsListResponse {
  friends: FriendWithProfile[];
  pendingReceived: FriendWithProfile[];
  pendingSent: FriendWithProfile[];
}

export interface UserSearchResult {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  total_points: number;
}

export interface SearchUsersResponse {
  users: UserSearchResult[];
}
