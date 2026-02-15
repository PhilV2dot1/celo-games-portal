"use client";

import { memo } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface GameControlsProps {
  timer: number;
  moves: number;
  formatTime: (seconds: number) => string;
  timeLimit?: number;
  fogRadius?: number;
  movingWalls?: boolean;
}

export const GameControls = memo(function GameControls({
  timer,
  moves,
  formatTime,
  timeLimit = 0,
  fogRadius = 0,
  movingWalls = false,
}: GameControlsProps) {
  const { t } = useLanguage();

  const isLowTime = timeLimit > 0 && timer <= 30;
  const isCriticalTime = timeLimit > 0 && timer <= 10;

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-xl p-4 shadow-lg border-2 border-gray-300 dark:border-gray-600">
      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {t("games.maze.moves")}
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {moves}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {t("stats.time")}
          </div>
          <div className={`text-2xl font-black ${
            isCriticalTime
              ? "text-red-600 animate-pulse"
              : isLowTime
                ? "text-orange-500"
                : "text-gray-900 dark:text-white"
          }`}>
            {formatTime(timer)}
          </div>
        </div>
      </div>
      {/* Active modifiers indicators */}
      {(fogRadius > 0 || movingWalls) && (
        <div className="flex justify-center gap-3 mt-2 text-xs">
          {fogRadius > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-medium">
              {t("games.maze.fogWarning")}
            </span>
          )}
          {movingWalls && (
            <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-medium">
              {t("games.maze.wallsMoving")}
            </span>
          )}
        </div>
      )}
    </div>
  );
});
