"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import type { GameStats } from "@/hooks/useRockPaperScissors";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface PlayerStatsProps {
  stats: GameStats;
  onReset?: () => void;
}

export const PlayerStats = memo(function PlayerStats({ stats, onReset }: PlayerStatsProps) {
  const { t } = useLanguage();

  // Memoize calculations to prevent unnecessary re-computation
  const { total, winRate } = useMemo(() => {
    const totalGames = stats.wins + stats.losses + stats.ties;
    const wr = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;
    return { total: totalGames, winRate: wr };
  }, [stats.wins, stats.losses, stats.ties]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 border-2 border-gray-700 shadow-xl"
      style={{
        boxShadow: "0 0 0 6px var(--chain-primary), 0 20px 25px -5px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900">{t('games.yourStats')}</h3>
        {onReset && total > 0 && (
          <button
            onClick={onReset}
            className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors font-semibold"
          >
            {t('games.reset')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center bg-green-50 border-2 border-green-200 rounded-xl p-3">
          <div className="text-2xl font-black text-green-600">
            {stats.wins}
          </div>
          <div className="text-xs font-semibold text-green-700">{t('stats.wins')}</div>
        </div>
        <div className="text-center bg-red-50 border-2 border-red-200 rounded-xl p-3">
          <div className="text-2xl font-black text-red-600">
            {stats.losses}
          </div>
          <div className="text-xs font-semibold text-red-700">{t('stats.losses')}</div>
        </div>
        <div className="text-center bg-chain/5 border-2 border-yellow-200 rounded-xl p-3">
          <div className="text-2xl font-black text-chain">
            {stats.ties}
          </div>
          <div className="text-xs font-semibold text-yellow-700">{t('stats.ties')}</div>
        </div>
      </div>

      <div className="flex items-center justify-between bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl p-3 border border-gray-200">
        <span className="text-sm font-semibold text-gray-700">
          {t('stats.winRate')}:
        </span>
        <span className="text-lg font-black text-gray-900">{winRate}%</span>
      </div>

      {/* Show streaks if available (on-chain mode) */}
      {(stats.currentStreak !== undefined || stats.bestStreak !== undefined) && (
        <div className="grid grid-cols-2 gap-2 mt-3">
          {stats.currentStreak !== undefined && (
            <div className="text-center bg-blue-50 border border-blue-200 rounded-lg p-2">
              <div className="text-sm font-bold text-blue-600">
                🔥 {stats.currentStreak}
              </div>
              <div className="text-xs text-blue-700">{t('stats.current')}</div>
            </div>
          )}
          {stats.bestStreak !== undefined && (
            <div className="text-center bg-gray-50 border border-gray-300 rounded-lg p-2">
              <div className="text-sm font-bold text-gray-700">
                🏆 {stats.bestStreak}
              </div>
              <div className="text-xs text-gray-600">{t('stats.best')}</div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
});
