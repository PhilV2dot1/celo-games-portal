"use client";

import { useEffect, useState, useCallback } from "react";
import { useConnect, useAccount } from "wagmi";
import { injected } from "wagmi/connectors";

// Extend Window to include MiniPay-specific provider properties
declare global {
  interface Window {
    ethereum?: {
      isMiniPay?: boolean;
      request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      [key: string]: unknown;
    };
  }
}

/**
 * Detects whether the app is running inside the MiniPay wallet browser.
 * Returns true only client-side when window.ethereum.isMiniPay === true.
 */
export function detectMiniPay(): boolean {
  if (typeof window === "undefined") return false;
  return window.ethereum?.isMiniPay === true;
}

interface UseMiniPayReturn {
  isInMiniPay: boolean;
  isAutoConnecting: boolean;
  isAutoConnected: boolean;
}

/**
 * Hook that detects MiniPay environment and auto-connects the injected wallet.
 * In MiniPay:
 *  - wallet is pre-granted, no user prompt needed
 *  - hide all "Connect Wallet" UI
 *  - auto-connect on mount using the injected provider
 */
export function useMiniPay(): UseMiniPayReturn {
  const [isInMiniPay, setIsInMiniPay] = useState(false);
  const [isAutoConnecting, setIsAutoConnecting] = useState(false);
  const [isAutoConnected, setIsAutoConnected] = useState(false);

  const { connect } = useConnect();
  const { isConnected } = useAccount();

  const autoConnect = useCallback(async () => {
    if (!detectMiniPay()) return;
    if (isConnected) {
      setIsAutoConnected(true);
      return;
    }
    setIsAutoConnecting(true);
    try {
      connect({ connector: injected() });
      setIsAutoConnected(true);
    } catch {
      // MiniPay provider available but connection failed — silent fail
    } finally {
      setIsAutoConnecting(false);
    }
  }, [connect, isConnected]);

  useEffect(() => {
    if (detectMiniPay()) {
      setIsInMiniPay(true);
      autoConnect();
    }
  }, [autoConnect]);

  // If already connected when entering MiniPay, mark as auto-connected
  useEffect(() => {
    if (isInMiniPay && isConnected) {
      setIsAutoConnected(true);
      setIsAutoConnecting(false);
    }
  }, [isInMiniPay, isConnected]);

  return { isInMiniPay, isAutoConnecting, isAutoConnected };
}
