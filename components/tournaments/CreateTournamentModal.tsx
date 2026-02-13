'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/components/auth/AuthProvider';

const MP_GAMES = [
  { id: 'tictactoe', name: 'Tic Tac Toe' },
  { id: 'rps', name: 'Rock Paper Scissors' },
  { id: 'connectfive', name: 'Connect 4' },
  { id: 'yahtzee', name: 'Yahtzee' },
  { id: 'blackjack', name: 'Blackjack' },
  { id: 'mastermind', name: 'Mastermind' },
];

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateTournamentModal({ isOpen, onClose, onCreated }: CreateTournamentModalProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [gameId, setGameId] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!user?.id || !name || !gameId) return;

    setCreating(true);
    setError(null);

    try {
      const res = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          gameId,
          name,
          maxPlayers,
          prizePoints: 100,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create tournament');
        return;
      }

      onCreated();
      onClose();
      setName('');
      setGameId('');
      setMaxPlayers(8);
    } catch (err) {
      setError('Failed to create tournament');
      console.error('[CreateTournament] Error:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t('tournament.create')}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Tournament Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">
              {t('tournament.name')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Tournament"
              maxLength={50}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              data-testid="tournament-name-input"
            />
          </div>

          {/* Game Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">
              {t('tournament.game')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MP_GAMES.map((game) => (
                <button
                  key={game.id}
                  onClick={() => setGameId(game.id)}
                  className={`p-2 text-xs font-semibold rounded-lg border transition-colors ${
                    gameId === game.id
                      ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {game.name}
                </button>
              ))}
            </div>
          </div>

          {/* Max Players */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">
              {t('tournament.maxPlayers')}
            </label>
            <div className="flex gap-2">
              {[8, 16].map((size) => (
                <button
                  key={size}
                  onClick={() => setMaxPlayers(size)}
                  className={`flex-1 p-2 text-sm font-semibold rounded-lg border transition-colors ${
                    maxPlayers === size
                      ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {size} {t('tournament.players')}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}

          {/* Create Button */}
          <button
            onClick={handleCreate}
            disabled={!name || !gameId || creating}
            className="w-full px-4 py-3 font-semibold text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            style={{ backgroundColor: 'var(--chain-primary)', color: 'var(--chain-contrast)' }}
            data-testid="tournament-create-submit"
          >
            {creating ? '...' : t('tournament.create')}
          </button>
        </div>
      </div>
    </div>
  );
}
