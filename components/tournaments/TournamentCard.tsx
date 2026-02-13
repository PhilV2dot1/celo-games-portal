'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Tournament } from '@/lib/tournaments/types';

interface TournamentCardProps {
  tournament: Tournament;
}

const STATUS_COLORS: Record<string, string> = {
  registration: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  completed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export function TournamentCard({ tournament }: TournamentCardProps) {
  const { t } = useLanguage();

  const spotsLeft = tournament.max_players - tournament.current_players;
  const statusKey = tournament.status as keyof typeof STATUS_COLORS;

  return (
    <Link
      href={`/tournaments/${tournament.id}`}
      className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
      data-testid="tournament-card"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
            {tournament.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {tournament.game_id} &middot; {t('tournament.singleElimination')}
          </p>
        </div>
        <span className={`shrink-0 ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${STATUS_COLORS[statusKey] || ''}`}>
          {t(`tournament.status.${tournament.status}` as never)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
          <span>
            {t('tournament.players')}: {tournament.current_players}/{tournament.max_players}
          </span>
          <span>
            {t('tournament.prize')}: {tournament.prize_points} pts
          </span>
        </div>

        {tournament.status === 'registration' && spotsLeft > 0 && (
          <span className="text-xs font-semibold" style={{ color: 'var(--chain-primary)' }}>
            {spotsLeft} {t('tournament.spotsLeft')}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${(tournament.current_players / tournament.max_players) * 100}%`,
            backgroundColor: 'var(--chain-primary)',
          }}
        />
      </div>
    </Link>
  );
}
