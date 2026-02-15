"use client";

import { memo } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface GameControlsProps {
  score: number;
  level: number;
  lines: number;
  timer: number;
  formatTime: (seconds: number) => string;
}

export const GameControls = memo(function GameControls({
  score,
  level,
  lines,
  timer,
  formatTime,
}: GameControlsProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-xl p-4 shadow-lg border-2 border-gray-300 dark:border-gray-600">
      <div className="grid grid-cols-4 gap-3 text-center">
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Score
          </div>
          <div className="text-xl font-black text-gray-900 dark:text-white">
            {score.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {t("games.tetris.level")}
          </div>
          <div className="text-xl font-black text-gray-900 dark:text-white">
            {level}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {t("games.tetris.lines")}
          </div>
          <div className="text-xl font-black text-gray-900 dark:text-white">
            {lines}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {t("stats.time")}
          </div>
          <div className="text-xl font-black text-gray-900 dark:text-white">
            {formatTime(timer)}
          </div>
        </div>
      </div>
    </div>
  );
});
