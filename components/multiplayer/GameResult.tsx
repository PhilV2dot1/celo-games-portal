"use client";

import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getEloTier } from "@/lib/multiplayer/elo";
import { PlayerCard } from "./PlayerCard";
import type { RoomPlayer, MultiplayerStats } from "@/lib/multiplayer/types";

interface GameResultProps {
  winner: RoomPlayer | null;
  loser: RoomPlayer | null;
  isDraw: boolean;
  isWinner: boolean | null; // null for draw
  myStats?: MultiplayerStats | null;
  opponentStats?: MultiplayerStats | null;
  eloChange?: {
    myChange: number;
    opponentChange: number;
  };
  onPlayAgain: () => void;
  onLeave: () => void;
}

export function GameResult({
  winner,
  loser,
  isDraw,
  isWinner,
  myStats,
  opponentStats,
  eloChange,
  onPlayAgain,
  onLeave,
}: GameResultProps) {
  const { t } = useLanguage();

  const resultText = isDraw
    ? t('multiplayer.draw') || "It's a Draw!"
    : isWinner
      ? t('multiplayer.youWin') || 'You Win!'
      : t('multiplayer.youLose') || 'You Lose';

  const resultEmoji = isDraw ? '🤝' : isWinner ? '🏆' : '😔';
  const resultColor = isDraw
    ? 'text-blue-600 dark:text-blue-400'
    : isWinner
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400';

  const myEloTier = myStats ? getEloTier(myStats.elo_rating) : null;

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl border-2 border-gray-300 dark:border-gray-600 shadow-xl max-w-md w-full">
      {/* Result */}
      <div className="text-center">
        <div className="text-6xl mb-3">{resultEmoji}</div>
        <h2 className={`text-3xl font-bold ${resultColor}`}>
          {resultText}
        </h2>
      </div>

      {/* ELO Change (for ranked) */}
      {eloChange && myStats && (
        <div className="w-full p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
          <div className="flex items-center justify-center gap-4">
            {/* Current ELO */}
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t('multiplayer.rating') || 'Rating'}
              </p>
              <div
                className="text-2xl font-bold"
                style={{ color: myEloTier?.color }}
              >
                {myStats.elo_rating}
              </div>
            </div>

            {/* Change */}
            <div
              className={`text-xl font-bold ${
                eloChange.myChange >= 0
                  ? 'text-green-500'
                  : 'text-red-500'
              }`}
            >
              {eloChange.myChange >= 0 ? '+' : ''}{eloChange.myChange}
            </div>

            {/* Tier */}
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t('multiplayer.tier') || 'Tier'}
              </p>
              <div
                className="text-lg font-semibold"
                style={{ color: myEloTier?.color }}
              >
                {myEloTier?.icon} {myEloTier?.name}
              </div>
            </div>
          </div>

          {/* Win streak */}
          {myStats.win_streak > 1 && (
            <div className="mt-3 text-center">
              <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                🔥 {myStats.win_streak} {t('multiplayer.winStreak') || 'Win Streak'}!
              </span>
            </div>
          )}
        </div>
      )}

      {/* Players */}
      {!isDraw && winner && loser && (
        <div className="w-full space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🥇</span>
            <div className="flex-1">
              <PlayerCard
                player={winner}
                isMe={isWinner === true}
                stats={isWinner ? myStats : opponentStats}
                compact
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🥈</span>
            <div className="flex-1">
              <PlayerCard
                player={loser}
                isMe={isWinner === false}
                stats={isWinner ? opponentStats : myStats}
                compact
              />
            </div>
          </div>
        </div>
      )}

      {/* Stats summary */}
      {myStats && (
        <div className="grid grid-cols-3 gap-4 w-full text-center">
          <div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {myStats.wins}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('stats.wins') || 'Wins'}
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {myStats.losses}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('stats.losses') || 'Losses'}
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {myStats.draws}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('stats.draws') || 'Draws'}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 w-full">
        <Button
          variant="ghost"
          size="md"
          onClick={onLeave}
          className="flex-1"
        >
          {t('multiplayer.leave') || 'Leave'}
        </Button>
        <Button
          variant="celo"
          size="md"
          onClick={onPlayAgain}
          className="flex-1"
        >
          {t('multiplayer.playAgain') || 'Play Again'}
        </Button>
      </div>
    </div>
  );
}

export default GameResult;
