"use client";

import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface ModeToggleProps {
  mode: 'free' | 'onchain';
  onModeChange: (mode: 'free' | 'onchain') => void;
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-2 border-2 border-gray-300 shadow-lg inline-flex gap-1">
      <Button
        variant={mode === "free" ? "celo" : "ghost"}
        size="md"
        onClick={() => onModeChange("free")}
        className={mode !== "free" ? "text-gray-600 hover:text-gray-900" : ""}
        ariaLabel={t('games.mode.switchToFree')}
      >
        🆓 {t('games.mode.freePlay')}
      </Button>
      <Button
        variant={mode === "onchain" ? "celo" : "ghost"}
        size="md"
        onClick={() => onModeChange("onchain")}
        className={mode !== "onchain" ? "text-gray-600 hover:text-gray-900" : ""}
        ariaLabel={t('games.mode.switchToOnChain')}
      >
        ⛓️ {t('games.mode.onChain')}
      </Button>
    </div>
  );
}
