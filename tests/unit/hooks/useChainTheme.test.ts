import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useChainTheme } from '@/hooks/useChainTheme';

// Mock useChainSelector
vi.mock('@/hooks/useChainSelector', () => ({
  useChainSelector: vi.fn(),
}));

import { useChainSelector } from '@/hooks/useChainSelector';

describe('useChainTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return celo theme when on Celo', () => {
    vi.mocked(useChainSelector).mockReturnValue({
      isOnCelo: true,
      isSupportedChain: true,
      isConnected: true,
      currentChain: { id: 42220 } as any,
      currentChainId: 42220,
      currentChainName: 'celo',
      currentChainConfig: null,
      switchToChain: vi.fn(),
      switchToCelo: vi.fn(),
    });

    const { result } = renderHook(() => useChainTheme());

    expect(result.current.activeChain).toBe('celo');
    expect(result.current.theme.primary).toBe('#FCFF52');
    expect(result.current.theme.contrastText).toBe('#111827');
    expect(result.current.isOnCelo).toBe(true);
  });

  test('should default to celo theme when disconnected', () => {
    vi.mocked(useChainSelector).mockReturnValue({
      isOnCelo: false,
      isSupportedChain: false,
      isConnected: false,
      currentChain: undefined as any,
      currentChainId: undefined,
      currentChainName: null,
      currentChainConfig: null,
      switchToChain: vi.fn(),
      switchToCelo: vi.fn(),
    });

    const { result } = renderHook(() => useChainTheme());

    expect(result.current.activeChain).toBe('celo');
    expect(result.current.theme.primary).toBe('#FCFF52');
    expect(result.current.isConnected).toBe(false);
  });

  test('should default to celo theme on unsupported chain', () => {
    vi.mocked(useChainSelector).mockReturnValue({
      isOnCelo: false,
      isSupportedChain: false,
      isConnected: true,
      currentChain: { id: 1 } as any,
      currentChainId: 1,
      currentChainName: null,
      currentChainConfig: null,
      switchToChain: vi.fn(),
      switchToCelo: vi.fn(),
    });

    const { result } = renderHook(() => useChainTheme());

    expect(result.current.activeChain).toBe('celo');
    expect(result.current.isSupportedChain).toBe(false);
  });

  test('should pass through isSupportedChain from useChainSelector', () => {
    vi.mocked(useChainSelector).mockReturnValue({
      isOnCelo: true,
      isSupportedChain: true,
      isConnected: true,
      currentChain: { id: 42220 } as any,
      currentChainId: 42220,
      currentChainName: 'celo',
      currentChainConfig: null,
      switchToChain: vi.fn(),
      switchToCelo: vi.fn(),
    });

    const { result } = renderHook(() => useChainTheme());

    expect(result.current.isSupportedChain).toBe(true);
  });

  test('theme should have all required properties', () => {
    vi.mocked(useChainSelector).mockReturnValue({
      isOnCelo: true,
      isSupportedChain: true,
      isConnected: true,
      currentChain: { id: 42220 } as any,
      currentChainId: 42220,
      currentChainName: 'celo',
      currentChainConfig: null,
      switchToChain: vi.fn(),
      switchToCelo: vi.fn(),
    });

    const { result } = renderHook(() => useChainTheme());

    expect(result.current.theme).toHaveProperty('primary');
    expect(result.current.theme).toHaveProperty('hover');
    expect(result.current.theme).toHaveProperty('light');
    expect(result.current.theme).toHaveProperty('dark');
    expect(result.current.theme).toHaveProperty('contrastText');
  });
});
