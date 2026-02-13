'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/components/auth/AuthProvider';

// Multiplayer-enabled games
const MP_GAMES = [
  { id: 'tictactoe', name: 'Tic Tac Toe' },
  { id: 'rps', name: 'Rock Paper Scissors' },
  { id: 'connectfive', name: 'Connect 4' },
  { id: 'yahtzee', name: 'Yahtzee' },
  { id: 'blackjack', name: 'Blackjack' },
  { id: 'mastermind', name: 'Mastermind' },
];

interface InviteToPlayProps {
  isOpen: boolean;
  onClose: () => void;
  friendUserId: string;
  friendUsername: string;
}

export function InviteToPlay({ isOpen, onClose, friendUsername }: InviteToPlayProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCreateRoom = async () => {
    if (!selectedGame || !user?.id) return;

    setCreating(true);
    try {
      const res = await fetch('/api/multiplayer/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          gameId: selectedGame,
          mode: '1v1-casual',
          isPrivate: true,
        }),
      });

      const data = await res.json();
      if (data.roomCode) {
        setRoomCode(data.roomCode);
      }
    } catch (err) {
      console.error('[InviteToPlay] Error creating room:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleCopyCode = async () => {
    if (!roomCode) return;
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t('friends.inviteToPlay')}
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
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Invite <span className="font-semibold text-gray-900 dark:text-white">{friendUsername}</span>
          </p>

          {!roomCode ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                  {t('friends.selectGame')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MP_GAMES.map((game) => (
                    <button
                      key={game.id}
                      onClick={() => setSelectedGame(game.id)}
                      className={`p-2 text-xs font-semibold rounded-lg border transition-colors ${
                        selectedGame === game.id
                          ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {game.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateRoom}
                disabled={!selectedGame || creating}
                className="w-full px-4 py-3 font-semibold text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                style={{ backgroundColor: 'var(--chain-primary)', color: 'var(--chain-contrast)' }}
              >
                {creating ? '...' : t('friends.inviteToPlay')}
              </button>
            </>
          ) : (
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('friends.inviteSent')}
              </p>
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('friends.copyCode')}</p>
                <p className="text-2xl font-mono font-bold text-gray-900 dark:text-white tracking-widest">
                  {roomCode}
                </p>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white font-semibold text-sm rounded-lg transition-colors"
              >
                {copied ? t('friends.codeCopied') : t('friends.copyCode')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
