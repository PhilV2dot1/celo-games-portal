'use client';

import { useEffect } from 'react';
import { useChainTheme } from '@/hooks/useChainTheme';

/**
 * Updates CSS custom properties on <html> based on the active chain.
 * When on Base, the UI shifts from Celo yellow to Base blue.
 * When disconnected or on Celo, uses the default Celo theme.
 *
 * Place this component inside the wagmi/wallet providers.
 */
export function ChainThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useChainTheme();

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--chain-primary', theme.primary);
    root.style.setProperty('--chain-hover', theme.hover);
    root.style.setProperty('--chain-light', theme.light);
    root.style.setProperty('--chain-dark', theme.dark);
    root.style.setProperty('--chain-contrast', theme.contrastText);
  }, [theme]);

  return <>{children}</>;
}
