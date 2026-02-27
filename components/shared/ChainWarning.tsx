'use client';

import { motion } from 'framer-motion';
import { useChainSelector } from '@/hooks/useChainSelector';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { CeloIcon } from './CeloIcon';

interface ChainWarningProps {
  className?: string;
}

export function ChainWarning({ className = '' }: ChainWarningProps) {
  const { isConnected, isSupportedChain: isSupported, currentChain, switchToCelo } = useChainSelector();
  const { t } = useLanguage();

  if (!isConnected || isSupported) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-400 rounded-xl p-4 ${className}`}
    >
      <p className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2">
        {t('chain.unsupported')}
      </p>
      <p className="text-xs text-orange-600 dark:text-orange-300 mb-3">
        {currentChain?.name || 'Unknown'} {t('chain.switchToPlay')}
      </p>
      <button
        onClick={switchToCelo}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg text-sm font-medium transition-colors"
      >
        <CeloIcon size={16} />
        <span>Switch to Celo</span>
      </button>
    </motion.div>
  );
}
