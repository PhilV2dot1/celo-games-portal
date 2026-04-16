"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

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
 * Checks window.ethereum.isMiniPay === true (real device) OR
 * sessionStorage flag "__minipay_sim" (test page simulation).
 */
export function detectMiniPay(): boolean {
  if (typeof window === "undefined") return false;
  if (window.ethereum?.isMiniPay === true) return true;
  // Allow test-page simulation to survive page reloads
  try {
    return sessionStorage.getItem("__minipay_sim") === "1";
  } catch {
    return false;
  }
}

interface UseMiniPayReturn {
  isInMiniPay: boolean;
}

/**
 * Lightweight hook — detection only.
 * Auto-connect is handled by MiniPayAutoConnect inside Providers (inside WagmiProvider).
 */
export function useMiniPay(): UseMiniPayReturn {
  const [isInMiniPay, setIsInMiniPay] = useState(false);
  const { isConnected } = useAccount();

  useEffect(() => {
    setIsInMiniPay(detectMiniPay());
  }, []);

  // Keep isConnected in deps to silence lint — not used but keeps hook alive
  void isConnected;

  return { isInMiniPay };
}
