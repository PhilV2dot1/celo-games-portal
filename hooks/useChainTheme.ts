'use client';

import { useChainSelector } from './useChainSelector';
import { chainThemes, type ChainThemeName, type ChainTheme } from '@/lib/constants/design-tokens';

/**
 * Hook that returns the active chain's theme colors.
 * Wraps useChainSelector and maps the active chain to its theme.
 *
 * Usage:
 *   const { theme, activeChain, isOnBase, isOnCelo } = useChainTheme();
 *   // theme.primary, theme.hover, theme.contrastText, etc.
 */
export function useChainTheme() {
  const { isOnBase, isOnCelo, isSupportedChain, isConnected } = useChainSelector();

  const activeChain: ChainThemeName = isOnBase ? 'base' : 'celo';
  const theme: ChainTheme = chainThemes[activeChain];

  return {
    activeChain,
    theme,
    isOnBase,
    isOnCelo,
    isSupportedChain,
    isConnected,
  };
}
