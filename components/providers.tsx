"use client";

import { useState, useEffect, ReactNode, createContext, useContext } from "react";
import { WagmiProvider, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { config } from "@/lib/wagmi";
import { celo } from 'wagmi/chains';
import { initializeFarcaster } from "@/lib/farcaster";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { AudioProvider } from "@/lib/audio/AudioContext";
import { ThemeProvider } from "@/lib/theme/ThemeContext";
import { ToastProvider } from "@/components/ui/Toast";
import { ChainThemeProvider } from "@/components/shared/ChainThemeProvider";
import { NotificationProvider } from "@/lib/notifications/NotificationContext";
import { OnboardingModal } from "@/components/shared/OnboardingModal";
import { BottomNav } from "@/components/layout/BottomNav";
import { MiniPayBanner } from "@/components/shared/MiniPayBanner";
import { detectMiniPay } from "@/hooks/useMiniPay";

import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      // Optimize for blockchain reads
      networkMode: 'online',
      gcTime: 0, // Don't cache blockchain reads globally
      staleTime: 0, // Always consider blockchain data stale
    },
  },
});

// ── Farcaster context ─────────────────────────────────────────────────────────
interface FarcasterContextType {
  isInFarcaster: boolean;
  isSDKReady: boolean;
}

const FarcasterContext = createContext<FarcasterContextType>({
  isInFarcaster: false,
  isSDKReady: false,
});

export const useFarcaster = () => useContext(FarcasterContext);

// ── MiniPay context ───────────────────────────────────────────────────────────
interface MiniPayContextType {
  isInMiniPay: boolean;
}

const MiniPayContext = createContext<MiniPayContextType>({ isInMiniPay: false });

export const useMiniPayContext = () => useContext(MiniPayContext);

// Stable connector instance — defined at module level to avoid re-creation on each render
const miniPayConnector = injected({ shimDisconnect: false });

/**
 * Inner component — rendered inside WagmiProvider so it can call useConnect.
 * Detects MiniPay and auto-connects the injected provider on mount.
 * Must be inside WagmiProvider to use wagmi hooks.
 */
function MiniPayAutoConnect({ isInMiniPay }: { isInMiniPay: boolean }) {
  const { connect } = useConnect();

  useEffect(() => {
    if (!isInMiniPay) return;
    // MiniPay pre-grants wallet access — connect silently on load, no user prompt
    connect({ connector: miniPayConnector });
  }, [isInMiniPay, connect]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isInFarcaster, setIsInFarcaster] = useState(false);
  const [isInMiniPay, setIsInMiniPay] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      // Detect MiniPay first (before Farcaster — these are mutually exclusive)
      const inMiniPay = detectMiniPay();
      setIsInMiniPay(inMiniPay);

      // Check if in Farcaster context (not applicable inside MiniPay)
      const inFC =
        !inMiniPay &&
        typeof window !== "undefined" &&
        ((window as Window & { fc?: unknown; farcaster?: unknown }).fc !== undefined ||
          (window as Window & { fc?: unknown; farcaster?: unknown }).farcaster !== undefined ||
          document.referrer.includes("warpcast.com"));

      setIsInFarcaster(inFC);

      // ALWAYS initialize Farcaster SDK (it calls ready() to dismiss splash)
      // Skip in MiniPay to avoid SDK conflicts
      if (!inMiniPay) {
        try {
          const success = await initializeFarcaster();
          if (!success && inFC) {
            console.warn("Farcaster SDK initialization returned false");
            setInitError("SDK initialization failed");
          }
        } catch (error) {
          console.error("SDK initialization error:", error);
          if (inFC) {
            setInitError(error instanceof Error ? error.message : "Unknown error");
          }
        }
      }

      // Always set as loaded to allow app to function
      setIsSDKLoaded(true);
    };
    load();
  }, []);

  if (!isSDKLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800">
        <div className="text-center">
          <div className="text-yellow-400 text-xl font-semibold mb-2">Loading...</div>
          <div className="text-sm text-gray-300">Initializing Celo Games Portal</div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AudioProvider>
          <FarcasterContext.Provider value={{ isInFarcaster, isSDKReady: !initError }}>
          <MiniPayContext.Provider value={{ isInMiniPay }}>
          <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider
              initialChain={celo}
              modalSize="wide"
              theme={lightTheme({
                accentColor: '#4B5563',
                accentColorForeground: 'white',
                borderRadius: 'large',
              })}
            >
              {/* Auto-connect injected wallet when inside MiniPay */}
              <MiniPayAutoConnect isInMiniPay={isInMiniPay} />
              <AuthProvider>
                <ChainThemeProvider>
                  <ToastProvider>
                    <NotificationProvider>
                      <MiniPayBanner />
                      {initError && isInFarcaster && (
                        <div className="bg-chain/5 border-l-4 border-chain p-3 text-xs text-yellow-700">
                          ⚠️ Farcaster SDK: {initError}
                        </div>
                      )}
                      {children}
                      <OnboardingModal />
                      <BottomNav />
                    </NotificationProvider>
                  </ToastProvider>
                </ChainThemeProvider>
              </AuthProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
          </WagmiProvider>
          </MiniPayContext.Provider>
          </FarcasterContext.Provider>
        </AudioProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
