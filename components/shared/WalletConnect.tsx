"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { motion } from "framer-motion";
import { useFarcaster, useMiniPayContext } from "../providers";
import { useChainSelector } from "@/hooks/useChainSelector";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const CONNECTOR_ICONS: Record<string, string> = {
  "Farcaster Wallet": "🔵",
  "WalletConnect": "🔗",
  "MetaMask": "🦊",
  "Rabby Wallet": "🟣",
  "Coinbase Wallet": "🔷",
  "Injected": "💼",
  "Browser Wallet": "💼",
};

export function WalletConnect() {
  const { address, isConnected, connector: activeConnector } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { isInFarcaster, isSDKReady } = useFarcaster();
  const { isInMiniPay } = useMiniPayContext();
  const { t } = useLanguage();

  // Connector descriptions with i18n
  const getConnectorDescription = (connectorName: string): string => {
    switch (connectorName) {
      case "Farcaster Wallet":
        return t('wallet.connectFarcaster');
      case "WalletConnect":
        return t('wallet.connectWalletConnect');
      case "MetaMask":
        return t('wallet.connectMetaMask');
      case "Coinbase Wallet":
        return t('wallet.connectCoinbase');
      case "Injected":
      case "Browser Wallet":
        return t('wallet.connectBrowser');
      default:
        return `${t('wallet.connectWith')} ${connectorName}`;
    }
  };

  const { isSupportedChain: isOnSupportedChain } = useChainSelector();
  const isSwitching = isConnected && !isOnSupportedChain;

  // Filter connectors based on context and deduplicate
  const availableConnectors = connectors.filter((connector, index, arr) => {
    // MiniPay uses its own UI path — never show connectors list inside MiniPay
    if (isInMiniPay) return false;
    // If not in Farcaster, hide Farcaster connector
    if (connector.name === "Farcaster Wallet" && !isInFarcaster) {
      return false;
    }
    // Hide generic "Injected" if a named injected wallet (MetaMask, Rabby, etc.) is present
    // but only when NOT in MiniPay (MiniPay uses injected connector exclusively)
    if (connector.name === "Injected" && !isInMiniPay) {
      const hasNamedInjected = arr.some(
        (c) => c.type === "injected" && c.name !== "Injected"
      );
      if (hasNamedInjected) return false;
    }
    // Deduplicate by name (keep first occurrence)
    const firstIndex = arr.findIndex((c) => c.name === connector.name);
    if (firstIndex !== index) return false;
    return true;
  });

  // ── MiniPay: wallet is pre-granted, no connect UI needed ────────────────────
  if (isInMiniPay) {
    if (isConnected && address) {
      return (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-green-900/30 border border-green-500/40 rounded-xl px-3 py-2"
        >
          <span className="text-lg">📱</span>
          <div className="flex flex-col min-w-0">
            <span className="text-green-300 text-xs font-bold">
              {t("wallet.miniPayConnected") || "MiniPay"}
            </span>
            <span className="font-mono text-xs text-gray-400">
              {address.slice(0, 6)}…{address.slice(-4)}
            </span>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse ml-auto" />
        </motion.div>
      );
    }
    // Still auto-connecting
    return (
      <div className="flex items-center gap-2 text-gray-400 text-xs px-2 py-2">
        <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        <span>{t("wallet.miniPayConnecting") || "Connecting MiniPay…"}</span>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="space-y-2">
        {/* Switching Network Warning */}
        {isSwitching && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-chain/10 border-2 border-chain rounded-xl p-3 flex items-center gap-3"
          >
            <div className="w-4 h-4 border-2 border-chain border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold text-gray-900">
              {t('wallet.switchingNetwork')}
            </span>
          </motion.div>
        )}

        {/* Connected Wallet Display */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-chain/30 to-gray-100 border-2 border-chain rounded-xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isOnSupportedChain ? 'bg-green-500' : 'bg-orange-500'}`} />
            <div className="flex flex-col">
              <span className="font-mono text-sm font-semibold text-gray-800">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              {activeConnector && (
                <span className="text-xs text-gray-600">
                  {t('wallet.via')} {activeConnector.name}
                </span>
              )}
            </div>
          </div>
          <Button
            onClick={() => disconnect()}
            variant="primary"
            size="sm"
            ariaLabel={t('wallet.disconnectLabel')}
          >
            {t('wallet.disconnect')}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-chain rounded-xl p-4">
      <p className="text-sm sm:text-base mb-3 text-center text-white font-semibold">
        {t('wallet.connectPrompt')}
      </p>

      {error && (
        <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded-lg text-xs text-red-700">
          {error.message}
        </div>
      )}

      {isInFarcaster && !isSDKReady && (
        <div className="mb-3 p-2 bg-chain/10 border border-chain/30 rounded-lg text-xs text-gray-900">
          {t('wallet.farcasterNotReady')}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {availableConnectors.map((connector) => {
          const icon = CONNECTOR_ICONS[connector.name] || "🔗";
          const description = getConnectorDescription(connector.name);

          return (
            <Button
              key={connector.uid}
              variant="celo"
              size="lg"
              fullWidth
              onClick={() => connect({ connector })}
              disabled={isPending}
              loading={isPending}
              ariaLabel={description}
              leftIcon={!isPending ? <span className="text-xl">{icon}</span> : undefined}
              className="flex-col gap-1 min-h-[56px]"
            >
              {!isPending && (
                <>
                  <span>{connector.name}</span>
                  <span className="text-xs text-gray-700">{description}</span>
                </>
              )}
            </Button>
          );
        })}
      </div>

      {availableConnectors.length === 0 && (
        <div className="text-center text-sm text-gray-300 py-4">
          {t('wallet.noConnectors')}
        </div>
      )}
    </div>
  );
}
