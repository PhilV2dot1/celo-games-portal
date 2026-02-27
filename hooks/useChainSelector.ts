'use client';

import { useCallback } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { celo } from 'wagmi/chains';
import { isSupportedChain, getChainName, CHAIN_CONFIG } from '@/lib/contracts/addresses';

/**
 * Hook for Celo-only chain support.
 * Simplified from multi-chain version — always targets Celo.
 */
export function useChainSelector() {
  const { chain, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();

  const currentChainId = chain?.id;
  const isSupported = currentChainId ? isSupportedChain(currentChainId) : false;
  const currentChainName = currentChainId ? getChainName(currentChainId) : null;

  const switchToCelo = useCallback(() => {
    if (isConnected && switchChain) {
      switchChain({ chainId: celo.id });
    }
  }, [isConnected, switchChain]);

  return {
    currentChain: chain,
    currentChainId,
    currentChainName,
    currentChainConfig: currentChainName ? CHAIN_CONFIG[currentChainName] : null,
    isSupportedChain: isSupported,
    isOnCelo: currentChainId === celo.id,
    isConnected,
    switchToCelo,
  };
}
