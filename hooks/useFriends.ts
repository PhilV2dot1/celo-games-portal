'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import type { FriendWithProfile, UserSearchResult } from '@/lib/social/types';

interface UseFriendsReturn {
  friends: FriendWithProfile[];
  pendingReceived: FriendWithProfile[];
  pendingSent: FriendWithProfile[];
  loading: boolean;
  error: string | null;
  sendRequest: (username: string) => Promise<boolean>;
  acceptRequest: (friendshipId: string) => Promise<boolean>;
  declineRequest: (friendshipId: string) => Promise<boolean>;
  removeFriend: (friendshipId: string) => Promise<boolean>;
  blockUser: (friendshipId: string) => Promise<boolean>;
  searchUsers: (query: string) => Promise<UserSearchResult[]>;
  refresh: () => Promise<void>;
}

export function useFriends(): UseFriendsReturn {
  const { user, isAuthenticated } = useAuth();
  const [friends, setFriends] = useState<FriendWithProfile[]>([]);
  const [pendingReceived, setPendingReceived] = useState<FriendWithProfile[]>([]);
  const [pendingSent, setPendingSent] = useState<FriendWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = useCallback(async () => {
    if (!user?.id || !isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/friends?userId=${user.id}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to fetch friends');
        return;
      }

      setFriends(data.friends || []);
      setPendingReceived(data.pendingReceived || []);
      setPendingSent(data.pendingSent || []);
    } catch (err) {
      setError('Failed to fetch friends');
      console.error('[useFriends] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, isAuthenticated]);

  // Initial fetch
  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  // Poll for updates every 30 seconds
  useEffect(() => {
    if (!user?.id || !isAuthenticated) return;

    const interval = setInterval(fetchFriends, 30000);
    return () => clearInterval(interval);
  }, [user?.id, isAuthenticated, fetchFriends]);

  const sendRequest = useCallback(async (username: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, friendUsername: username }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send request');
        return false;
      }

      await fetchFriends();
      return true;
    } catch (err) {
      setError('Failed to send friend request');
      console.error('[useFriends] sendRequest error:', err);
      return false;
    }
  }, [user?.id, fetchFriends]);

  const acceptRequest = useCallback(async (friendshipId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept', userId: user.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to accept request');
        return false;
      }

      await fetchFriends();
      return true;
    } catch (err) {
      setError('Failed to accept request');
      console.error('[useFriends] acceptRequest error:', err);
      return false;
    }
  }, [user?.id, fetchFriends]);

  const declineRequest = useCallback(async (friendshipId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const res = await fetch(`/api/friends/${friendshipId}?userId=${user.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to decline request');
        return false;
      }

      await fetchFriends();
      return true;
    } catch (err) {
      setError('Failed to decline request');
      console.error('[useFriends] declineRequest error:', err);
      return false;
    }
  }, [user?.id, fetchFriends]);

  const removeFriend = useCallback(async (friendshipId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const res = await fetch(`/api/friends/${friendshipId}?userId=${user.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to remove friend');
        return false;
      }

      await fetchFriends();
      return true;
    } catch (err) {
      setError('Failed to remove friend');
      console.error('[useFriends] removeFriend error:', err);
      return false;
    }
  }, [user?.id, fetchFriends]);

  const blockUser = useCallback(async (friendshipId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'block', userId: user.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to block user');
        return false;
      }

      await fetchFriends();
      return true;
    } catch (err) {
      setError('Failed to block user');
      console.error('[useFriends] blockUser error:', err);
      return false;
    }
  }, [user?.id, fetchFriends]);

  const searchUsers = useCallback(async (query: string): Promise<UserSearchResult[]> => {
    if (!user?.id || query.length < 2) return [];

    try {
      const res = await fetch(`/api/friends/search?q=${encodeURIComponent(query)}&userId=${user.id}`);
      const data = await res.json();

      if (!res.ok) return [];

      return data.users || [];
    } catch (err) {
      console.error('[useFriends] searchUsers error:', err);
      return [];
    }
  }, [user?.id]);

  return {
    friends,
    pendingReceived,
    pendingSent,
    loading,
    error,
    sendRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
    blockUser,
    searchUsers,
    refresh: fetchFriends,
  };
}
