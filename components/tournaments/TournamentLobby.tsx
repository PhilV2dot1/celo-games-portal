'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Tournament, TournamentParticipant } from '@/lib/tournaments/types';

interface TournamentLobbyProps {
  tournament: Tournament;
  participants: TournamentParticipant[];
  isJoined: boolean;
  onJoin: () => Promise<boolean>;
  onLeave: () => Promise<boolean>;
  loading?: boolean;
}

export function TournamentLobby({
  tournament,
  participants,
  isJoined,
  onJoin,
  onLeave,
  loading,
}: TournamentLobbyProps) {
  const { t } = useLanguage();
  const spotsLeft = tournament.max_players - tournament.current_players;

  return (
    <div className="space-y-4">
      {/* Status banner */}
      <div className="p-4 rounded-lg text-center" style={{ backgroundColor: 'color-mix(in srgb, var(--chain-primary) 10%, transparent)' }}>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {t('tournament.registrationOpen')}
        </p>
        <p className="text-2xl font-black mt-1" style={{ color: 'var(--chain-primary)' }}>
          {spotsLeft} {t('tournament.spotsLeft')}
        </p>
        {!tournament.starts_at && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('tournament.startsWhenFull')}
          </p>
        )}
      </div>

      {/* Join/Leave button */}
      <div className="flex gap-2">
        {!isJoined ? (
          <button
            onClick={onJoin}
            disabled={loading || spotsLeft <= 0}
            className="flex-1 px-4 py-3 font-semibold text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            style={{ backgroundColor: 'var(--chain-primary)', color: 'var(--chain-contrast)' }}
            data-testid="tournament-join"
          >
            {t('tournament.join')}
          </button>
        ) : (
          <button
            onClick={onLeave}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-50"
            data-testid="tournament-leave"
          >
            {t('tournament.leave')}
          </button>
        )}
      </div>

      {/* Participants list */}
      <div>
        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">
          {t('tournament.participants')} ({participants.length}/{tournament.max_players})
        </h3>
        <div className="space-y-2">
          {participants.map((p, index) => (
            <div
              key={p.user_id}
              className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <span className="w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-400 dark:text-gray-500">
                #{index + 1}
              </span>
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                {(p.display_name || p.username || '?')[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {p.display_name || p.username || `Player ${p.seed}`}
              </span>
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: spotsLeft }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex items-center gap-3 p-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600"
            >
              <span className="w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-300 dark:text-gray-600">
                #{participants.length + i + 1}
              </span>
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-300 dark:text-gray-600">
                ?
              </div>
              <span className="text-sm text-gray-400 dark:text-gray-500 italic">
                {t('tournament.waitingForOpponent')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
