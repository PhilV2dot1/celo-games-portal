'use client';

import { useMemo } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getRoundCount, getRoundLabel } from '@/lib/tournaments/bracket';
import type { TournamentMatch } from '@/lib/tournaments/types';

interface TournamentBracketProps {
  matches: TournamentMatch[];
  maxPlayers: number;
  currentUserId?: string | null;
}

function MatchCard({
  match,
  currentUserId,
}: {
  match: TournamentMatch;
  currentUserId?: string | null;
}) {
  const { t } = useLanguage();

  const isMyMatch = currentUserId && (match.player1_id === currentUserId || match.player2_id === currentUserId);
  const isLive = match.status === 'playing';
  const isCompleted = match.status === 'completed';
  const isBye = match.status === 'bye';

  return (
    <div
      className={`rounded-lg border text-xs overflow-hidden ${
        isMyMatch
          ? 'border-2 ring-1 ring-offset-1'
          : 'border-gray-200 dark:border-gray-700'
      }`}
      style={isMyMatch ? { borderColor: 'var(--chain-primary)', outlineColor: 'var(--chain-primary)' } : undefined}
    >
      {/* Status badge */}
      {(isLive || isBye) && (
        <div className={`px-2 py-0.5 text-center text-[10px] font-bold ${
          isLive ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
        }`}>
          {isLive ? t('tournament.matchLive') : t('tournament.matchBye')}
        </div>
      )}

      {/* Player 1 */}
      <div className={`flex items-center justify-between px-2 py-1.5 ${
        isCompleted && match.winner_id === match.player1_id
          ? 'bg-green-50 dark:bg-green-900/20 font-bold'
          : 'bg-white dark:bg-gray-800'
      }`}>
        <span className={`truncate ${
          match.player1_id
            ? 'text-gray-900 dark:text-white'
            : 'text-gray-400 dark:text-gray-600 italic'
        }`}>
          {match.player1_username || (match.player1_id ? '...' : t('tournament.matchPending'))}
        </span>
        {isCompleted && match.winner_id === match.player1_id && (
          <span className="text-green-600 dark:text-green-400 ml-1">W</span>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* Player 2 */}
      <div className={`flex items-center justify-between px-2 py-1.5 ${
        isCompleted && match.winner_id === match.player2_id
          ? 'bg-green-50 dark:bg-green-900/20 font-bold'
          : 'bg-white dark:bg-gray-800'
      }`}>
        <span className={`truncate ${
          match.player2_id
            ? 'text-gray-900 dark:text-white'
            : 'text-gray-400 dark:text-gray-600 italic'
        }`}>
          {match.player2_username || (match.player2_id ? '...' : t('tournament.matchPending'))}
        </span>
        {isCompleted && match.winner_id === match.player2_id && (
          <span className="text-green-600 dark:text-green-400 ml-1">W</span>
        )}
      </div>
    </div>
  );
}

export function TournamentBracket({ matches, maxPlayers, currentUserId }: TournamentBracketProps) {
  const { t } = useLanguage();
  const totalRounds = getRoundCount(maxPlayers);

  // Organize matches by round
  const roundsData = useMemo(() => {
    const rounds: { round: number; label: string; matches: TournamentMatch[] }[] = [];

    for (let r = 1; r <= totalRounds; r++) {
      const roundMatches = matches
        .filter(m => m.round === r)
        .sort((a, b) => a.match_number - b.match_number);

      rounds.push({
        round: r,
        label: getRoundLabel(r, totalRounds),
        matches: roundMatches,
      });
    }

    return rounds;
  }, [matches, totalRounds]);

  if (matches.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
        {t('tournament.bracket')} - {t('tournament.matchPending')}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4" data-testid="tournament-bracket">
      <div className="flex gap-6 min-w-max">
        {roundsData.map((round) => (
          <div key={round.round} className="flex flex-col">
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 text-center">
              {round.round === totalRounds ? t('tournament.finals') :
               round.round === totalRounds - 1 ? t('tournament.semiFinals') :
               round.round === totalRounds - 2 ? t('tournament.quarterFinals') :
               `${t('tournament.round')} ${round.round}`}
            </h4>
            <div className="flex flex-col gap-4 justify-around flex-1" style={{ minWidth: '140px' }}>
              {round.matches.map((match) => (
                <MatchCard
                  key={match.id || `${match.round}-${match.match_number}`}
                  match={match}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
