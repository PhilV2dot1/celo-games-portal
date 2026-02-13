'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import type { Tournament, TournamentParticipant, TournamentMatch } from '@/lib/tournaments/types';

interface UseTournamentReturn {
  tournament: Tournament | null;
  participants: TournamentParticipant[];
  matches: TournamentMatch[];
  myMatch: TournamentMatch | null;
  isJoined: boolean;
  loading: boolean;
  error: string | null;
  joinTournament: () => Promise<boolean>;
  leaveTournament: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useTournament(tournamentId: string): UseTournamentReturn {
  const { user, isAuthenticated } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [internalUserId, setInternalUserId] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Resolve internal user ID
  useEffect(() => {
    if (!user?.id || !isAuthenticated) return;

    fetch(`/api/user/profile?id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.user?.id) {
          setInternalUserId(data.user.id);
        }
      })
      .catch(() => {});
  }, [user?.id, isAuthenticated]);

  const fetchTournament = useCallback(async () => {
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to fetch tournament');
        return;
      }

      setTournament(data.tournament);
      setParticipants(data.participants || []);
      setMatches(data.matches || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tournament');
      console.error('[useTournament] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  // Initial fetch
  useEffect(() => {
    fetchTournament();
  }, [fetchTournament]);

  // Poll during in_progress
  useEffect(() => {
    if (tournament?.status === 'in_progress') {
      pollingRef.current = setInterval(fetchTournament, 10000);
    } else if (tournament?.status === 'registration') {
      pollingRef.current = setInterval(fetchTournament, 15000);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [tournament?.status, fetchTournament]);

  // Find my current match
  const myMatch = matches.find(
    m =>
      m.status === 'pending' &&
      internalUserId &&
      (m.player1_id === internalUserId || m.player2_id === internalUserId) &&
      m.player1_id !== null &&
      m.player2_id !== null
  ) || null;

  const isJoined = internalUserId
    ? participants.some(p => p.user_id === internalUserId)
    : false;

  const joinTournament = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to join tournament');
        return false;
      }

      await fetchTournament();
      return true;
    } catch (err) {
      setError('Failed to join tournament');
      console.error('[useTournament] joinTournament error:', err);
      return false;
    }
  }, [user?.id, tournamentId, fetchTournament]);

  const leaveTournament = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to leave tournament');
        return false;
      }

      await fetchTournament();
      return true;
    } catch (err) {
      setError('Failed to leave tournament');
      console.error('[useTournament] leaveTournament error:', err);
      return false;
    }
  }, [user?.id, tournamentId, fetchTournament]);

  return {
    tournament,
    participants,
    matches,
    myMatch,
    isJoined,
    loading,
    error,
    joinTournament,
    leaveTournament,
    refresh: fetchTournament,
  };
}
