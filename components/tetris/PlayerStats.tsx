"use client";

import { memo } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { PlayerStats as PlayerStatsType } from "@/hooks/useTetris";

interface PlayerStatsProps {
  stats: PlayerStatsType;
}

export const PlayerStats = memo(function PlayerStats({ stats }: PlayerStatsProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-center">
        {t("stats.title")}
      </h3>
      <div className="grid grid-cols-3 gap-3 text-center text-sm">
        <div>
          <div className="text-gray-500 dark:text-gray-400">{t("stats.gamesPlayed")}</div>
          <div className="font-bold text-gray-900 dark:text-white">{stats.games}</div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">{t("stats.wins")}</div>
          <div className="font-bold text-gray-900 dark:text-white">{stats.wins}</div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">{t("stats.bestScore")}</div>
          <div className="font-bold text-gray-900 dark:text-white">
            {stats.bestScore > 0 ? stats.bestScore.toLocaleString() : "-"}
          </div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">{t("games.tetris.lines")}</div>
          <div className="font-bold text-gray-900 dark:text-white">{stats.totalLines}</div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">{t("games.tetris.level")}</div>
          <div className="font-bold text-gray-900 dark:text-white">
            {stats.highestLevel > 0 ? stats.highestLevel : "-"}
          </div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">{t("stats.winRate")}</div>
          <div className="font-bold text-gray-900 dark:text-white">
            {stats.games > 0
              ? `${Math.round((stats.wins / stats.games) * 100)}%`
              : "-"}
          </div>
        </div>
      </div>
    </div>
  );
});
