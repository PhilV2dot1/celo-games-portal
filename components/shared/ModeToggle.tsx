"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useMiniPayContext } from "@/components/providers";

interface ModeToggleProps {
  mode: 'free' | 'onchain';
  onModeChange: (mode: 'free' | 'onchain') => void;
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  const { t } = useLanguage();
  const { isInMiniPay } = useMiniPayContext();

  // In MiniPay, always force on-chain mode (wallet is always connected)
  useEffect(() => {
    if (isInMiniPay && mode !== "onchain") {
      onModeChange("onchain");
    }
  }, [isInMiniPay, mode, onModeChange]);

  // In MiniPay, hide the toggle entirely — on-chain is the only mode
  if (isInMiniPay) {
    return (
      <div className="flex items-center gap-1.5 bg-green-900/20 border border-green-500/30 rounded-xl px-3 py-1.5 text-xs font-semibold text-green-300">
        📱 {t("wallet.miniPayMode") || "MiniPay · On-Chain"}
      </div>
    );
  }

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
