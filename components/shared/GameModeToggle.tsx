"use client";

import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type GameMode = 'free' | 'onchain' | 'multiplayer';

interface GameModeToggleProps {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
  showMultiplayer?: boolean;
}

export function GameModeToggle({
  mode,
  onModeChange,
  showMultiplayer = true
}: GameModeToggleProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-2 border-2 border-gray-300 dark:border-gray-600 shadow-lg inline-flex gap-1 flex-wrap justify-center">
      <Button
        variant={mode === "free" ? "celo" : "ghost"}
        size="md"
        onClick={() => onModeChange("free")}
        className={mode !== "free" ? "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" : ""}
        ariaLabel={t('games.mode.switchToFree')}
      >
        🆓 {t('games.mode.freePlay')}
      </Button>
      <Button
        variant={mode === "onchain" ? "celo" : "ghost"}
        size="md"
        onClick={() => onModeChange("onchain")}
        className={mode !== "onchain" ? "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" : ""}
        ariaLabel={t('games.mode.switchToOnChain')}
      >
        ⛓️ {t('games.mode.onChain')}
      </Button>
      {showMultiplayer && (
        <Button
          variant={mode === "multiplayer" ? "celo" : "ghost"}
          size="md"
          onClick={() => onModeChange("multiplayer")}
          className={mode !== "multiplayer" ? "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" : ""}
          ariaLabel={t('multiplayer.play') || 'Play Multiplayer'}
        >
          👥 {t('multiplayer.play') || 'Multiplayer'}
        </Button>
      )}
    </div>
  );
}

export default GameModeToggle;
