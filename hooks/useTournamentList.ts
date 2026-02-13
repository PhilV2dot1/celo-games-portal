'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Tournament } from '@/lib/tournaments/types';

interface UseTournamentListReturn {
  tournaments: Tournament[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useTournamentList(
  gameId?: string,
  status?: string,
): UseTournamentListReturn {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (gameId) params.set('gameId', gameId);
      if (status) params.set('status', status);

      const res = await fetch(`/api/tournaments?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to fetch tournaments');
        return;
      }

      setTournaments(data.tournaments || []);
    } catch (err) {
      setError('Failed to fetch tournaments');
      console.error('[useTournamentList] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [gameId, status]);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  return {
    tournaments,
    loading,
    error,
    refresh: fetchTournaments,
  };
}
