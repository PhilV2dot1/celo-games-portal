'use client';

import { useCallback } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { celo, base } from 'wagmi/chains';
import { isSupportedChain, getChainName, CHAIN_CONFIG, type SupportedChain } from '@/lib/contracts/addresses';

/**
 * Hook for multichain support - replaces useSwitchToCelo.
 * Accepts both Celo and Base networks.
 */
export function useChainSelector() {
  const { chain, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();

  const currentChainId = chain?.id;
  const isSupported = currentChainId ? isSupportedChain(currentChainId) : false;
  const currentChainName = currentChainId ? getChainName(currentChainId) : null;

  const switchToChain = useCallback(
    (chainId: number) => {
      if (switchChain) {
        switchChain(
          { chainId },
          {
            onSuccess: () => {
              const name = getChainName(chainId);
              console.log(`Switched to ${name} network`);
            },
            onError: (error) => {
              console.error(`Failed to switch network:`, error);
            },
          }
        );
      }
    },
    [switchChain]
  );

  const switchToCelo = useCallback(() => switchToChain(celo.id), [switchToChain]);
  const switchToBase = useCallback(() => switchToChain(base.id), [switchToChain]);

  return {
    currentChain: chain,
    currentChainId,
    currentChainName,
    currentChainConfig: currentChainName ? CHAIN_CONFIG[currentChainName] : null,
    isSupportedChain: isSupported,
    isOnCelo: currentChainId === celo.id,
    isOnBase: currentChainId === base.id,
    isConnected,
    switchToChain,
    switchToCelo,
    switchToBase,
  };
}
