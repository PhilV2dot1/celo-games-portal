import { useEffect } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { celo } from 'wagmi/chains';
import { isSupportedChain } from '@/lib/contracts/addresses';

/**
 * Hook to automatically switch to Celo network when connected on an unsupported chain.
 * Celo, Base, and MegaETH are all supported — only truly unsupported chains trigger a switch.
 */
export function useSwitchToCelo() {
  const { chain, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    // Only switch if on an unsupported chain (not Celo, Base, or MegaETH)
    if (isConnected && chain && !isSupportedChain(chain.id) && switchChain) {
      console.log(`Unsupported network detected: ${chain.name} (${chain.id}). Switching to Celo...`);

      switchChain(
        { chainId: celo.id },
        {
          onSuccess: () => {
            console.log('Successfully switched to Celo network');
          },
          onError: (error) => {
            console.error('Failed to switch to Celo network:', error);
          },
        }
      );
    }
  }, [isConnected, chain, switchChain]);

  return {
    isOnCelo: chain?.id === celo.id,
    isOnSupportedChain: chain ? isSupportedChain(chain.id) : false,
    currentChain: chain,
    isSwitching: isConnected && chain ? !isSupportedChain(chain.id) : false,
  };
}
