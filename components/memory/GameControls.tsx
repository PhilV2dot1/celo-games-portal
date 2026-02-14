"use client";

import { memo } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface GameControlsProps {
  timer: number;
  moves: number;
  pairsFound: number;
  totalPairs: number;
  formatTime: (seconds: number) => string;
}

export const GameControls = memo(function GameControls({
  timer,
  moves,
  pairsFound,
  totalPairs,
  formatTime,
}: GameControlsProps) {
  const { t } = useLanguage();

  return (
    <div
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-xl p-4 grid grid-cols-3 gap-4 shadow-lg"
      style={{ border: "4px solid var(--chain-primary)" }}
    >
      <div className="text-center">
        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {t("games.memory.moves")}
        </div>
        <div className="text-2xl font-black text-gray-900 dark:text-white">
          {moves}
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {t("games.memory.pairsFound")}
        </div>
        <div className="text-2xl font-black text-gray-900 dark:text-white">
          {pairsFound}/{totalPairs}
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          ⏱️
        </div>
        <div className="text-2xl font-black text-gray-900 dark:text-white">
          {formatTime(timer)}
        </div>
      </div>
    </div>
  );
});
