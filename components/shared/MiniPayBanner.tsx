"use client";

import { motion } from "framer-motion";
import { useMiniPayContext } from "@/components/providers";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/**
 * Shown at the top of the portal when the user is inside the MiniPay wallet.
 * Renders nothing when not in MiniPay.
 */
export function MiniPayBanner() {
  const { isInMiniPay } = useMiniPayContext();
  const { t } = useLanguage();

  if (!isInMiniPay) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full bg-gradient-to-r from-green-900/60 to-emerald-900/60 border-b border-green-500/30 px-4 py-2.5"
    >
      <div className="max-w-xl mx-auto flex items-center gap-3">
        {/* MiniPay logo placeholder */}
        <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/40 flex items-center justify-center flex-shrink-0">
          <span className="text-lg leading-none">📱</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-green-300 text-xs font-bold leading-tight">
            {t("miniPay.bannerTitle") || "MiniPay"}
          </p>
          <p className="text-gray-400 text-[11px] leading-tight">
            {t("miniPay.bannerSubtitle") || "Wallet connected · On-chain mode enabled"}
          </p>
        </div>
        {/* Celo badge */}
        <div className="flex items-center gap-1 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-2 py-0.5 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
          <span className="text-yellow-400 text-[10px] font-bold">Celo</span>
        </div>
      </div>
    </motion.div>
  );
}
