import { createConfig, http, cookieStorage, createStorage } from "wagmi";
import { injected } from "wagmi/connectors";
import { celo } from "wagmi/chains";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  walletConnectWallet,
  rabbyWallet,
  braveWallet,
  metaMaskWallet,
  phantomWallet,
  valoraWallet,
} from "@rainbow-me/rainbowkit/wallets";

const celoRpcUrl = "https://forno.celo.org";

function getAppUrl() {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
}

// WalletConnect project ID - get one from https://cloud.walletconnect.com
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'PLACEHOLDER';

const connectors = connectorsForWallets(
  [
    {
      groupName: "Popular",
      wallets: [
        coinbaseWallet,
        metaMaskWallet,
        rabbyWallet,
        braveWallet,
        valoraWallet,
      ],
    },
    {
      groupName: "More",
      wallets: [
        walletConnectWallet,
        phantomWallet,
      ],
    },
  ],
  {
    appName: "Celo Games Portal",
    projectId: walletConnectProjectId,
    appDescription: "Play 15 mini-games on Celo blockchain! Blackjack, RPS, TicTacToe, Solitaire, and more.",
    appUrl: getAppUrl(),
    appIcon: `${getAppUrl()}/icon.png`,
  }
);

// Stable injected connector instance for MiniPay (window.ethereum)
const injectedConnector = injected({ shimDisconnect: false });

export const config = createConfig({
  chains: [celo],
  multiInjectedProviderDiscovery: false,
  connectors: [
    // MiniPay uses the injected window.ethereum provider — must be first for auto-connect
    injectedConnector,
    // Farcaster Mini App connector (only active inside Farcaster/Warpcast)
    farcasterMiniApp(),
    ...connectors,
  ],
  transports: {
    [celo.id]: http(celoRpcUrl, {
      batch: true,
      retryCount: 3,
      retryDelay: 1000,
      timeout: 10_000,
    }),
  },
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
    key: 'celo-games-portal',
  }),
});
