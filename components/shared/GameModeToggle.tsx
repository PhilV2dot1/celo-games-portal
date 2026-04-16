"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useMiniPayContext } from "@/components/providers";

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
  const { isInMiniPay } = useMiniPayContext();

  // In MiniPay, always force on-chain mode
  useEffect(() => {
    if (isInMiniPay && mode !== "onchain") {
      onModeChange("onchain");
    }
  }, [isInMiniPay, mode, onModeChange]);

  // In MiniPay, show only an indicator — no toggle needed
  if (isInMiniPay) {
    return (
      <div className="flex items-center gap-1.5 bg-green-900/20 border border-green-500/30 rounded-xl px-3 py-1.5 text-xs font-semibold text-green-300">
        📱 {t("wallet.miniPayMode") || "MiniPay · On-Chain"}
      </div>
    );
  }

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
