"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useConnect, useDisconnect, useBalance, useChainId } from "wagmi";
import { injected } from "wagmi/connectors";
import { celo } from "wagmi/chains";
import Link from "next/link";
import { detectMiniPay, useMiniPay } from "@/hooks/useMiniPay";
import { useMiniPayContext } from "@/components/providers";
import { ModeToggle } from "@/components/shared/ModeToggle";
import { GameModeToggle } from "@/components/shared/GameModeToggle";
import { WalletConnect } from "@/components/shared/WalletConnect";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CheckItem {
  id: string;
  label: string;
  status: "pass" | "fail" | "warn" | "pending";
  detail?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: CheckItem["status"] }) {
  const colors: Record<CheckItem["status"], string> = {
    pass:    "bg-green-400",
    fail:    "bg-red-400",
    warn:    "bg-yellow-400",
    pending: "bg-gray-500 animate-pulse",
  };
  const icons: Record<CheckItem["status"], string> = {
    pass: "✓", fail: "✗", warn: "⚠", pending: "…",
  };
  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-black text-gray-900 ${colors[status]}`}>
      {icons[status]}
    </span>
  );
}

function Row({ item }: { item: CheckItem }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
      <StatusDot status={item.status} />
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold leading-tight">{item.label}</p>
        {item.detail && (
          <p className="text-gray-400 text-xs mt-0.5 font-mono break-all">{item.detail}</p>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 mb-4">
      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-3">{title}</p>
      {children}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TestMiniPayPage() {
  const { address, isConnected, connector } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { isInMiniPay: contextMiniPay } = useMiniPayContext();
  const { isInMiniPay: hookMiniPay } = useMiniPay();
  const [modeToggle, setModeToggle] = useState<"free" | "onchain">("free");
  const [gameModeToggle, setGameModeToggle] = useState<"free" | "onchain" | "multiplayer">("free");
  const [simActive, setSimActive] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const { data: balance } = useBalance({
    address,
    query: { enabled: isConnected },
  });

  const addLog = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLog((prev) => [`[${ts}] ${msg}`, ...prev.slice(0, 49)]);
  }, []);

  // Track connection events
  useEffect(() => {
    if (isConnected && address) addLog(`✅ Wallet connecté: ${address.slice(0, 8)}…`);
  }, [isConnected, address, addLog]);

  useEffect(() => {
    if (!isConnected) addLog("🔌 Wallet déconnecté");
  }, [isConnected, addLog]);

  useEffect(() => {
    if (contextMiniPay) addLog("📱 MiniPay détecté via Context");
  }, [contextMiniPay, addLog]);

  // ── Simulation MiniPay ────────────────────────────────────────────────────
  const FAKE_ADDRESS = "0x742d35Cc6634C0532925a3b8D4C9C6b9f79E6B1a";

  function activateSimulation() {
    if (typeof window === "undefined") return;
    // Inject fake MiniPay provider
    (window as Window & { ethereum?: unknown }).ethereum = {
      isMiniPay: true,
      isMetaMask: false,
      request: async ({ method }: { method: string }) => {
        addLog(`📡 eth_request: ${method}`);
        if (method === "eth_requestAccounts") return [FAKE_ADDRESS];
        if (method === "eth_accounts") return [FAKE_ADDRESS];
        if (method === "eth_chainId") return "0xa4ec"; // Celo mainnet
        if (method === "net_version") return "42220";
        if (method === "wallet_switchEthereumChain") return null;
        return null;
      },
      on: () => {},
      removeListener: () => {},
    };
    setSimActive(true);
    addLog("🔧 Simulation MiniPay activée — rechargement dans 1s…");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  function deactivateSimulation() {
    if (typeof window === "undefined") return;
    // Remove fake provider
    delete (window as Window & { ethereum?: unknown }).ethereum;
    setSimActive(false);
    addLog("🔧 Simulation désactivée — rechargement dans 1s…");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  // ── Checks ────────────────────────────────────────────────────────────────
  const checks: CheckItem[] = [
    {
      id: "ethereum",
      label: "window.ethereum présent",
      status: typeof window !== "undefined" && window.ethereum ? "pass" : "fail",
      detail: typeof window !== "undefined" && window.ethereum
        ? `type: ${typeof window.ethereum}`
        : "window.ethereum est undefined",
    },
    {
      id: "isMiniPay",
      label: "window.ethereum.isMiniPay === true",
      status: typeof window !== "undefined" && window.ethereum?.isMiniPay ? "pass" : "fail",
      detail: typeof window !== "undefined"
        ? `isMiniPay = ${String(window.ethereum?.isMiniPay)}`
        : "SSR",
    },
    {
      id: "detectFn",
      label: "detectMiniPay() retourne true",
      status: detectMiniPay() ? "pass" : "fail",
      detail: `detectMiniPay() = ${String(detectMiniPay())}`,
    },
    {
      id: "hook",
      label: "useMiniPay() hook détecte MiniPay",
      status: hookMiniPay ? "pass" : "fail",
      detail: `isInMiniPay = ${String(hookMiniPay)}`,
    },
    {
      id: "context",
      label: "MiniPayContext propagé dans l'app",
      status: contextMiniPay ? "pass" : "fail",
      detail: `useMiniPayContext().isInMiniPay = ${String(contextMiniPay)}`,
    },
    {
      id: "wallet",
      label: "Wallet auto-connecté",
      status: isConnected ? "pass" : contextMiniPay ? "warn" : "fail",
      detail: isConnected
        ? `${address} via ${connector?.name}`
        : contextMiniPay ? "MiniPay détecté mais connexion en cours…" : "Non connecté",
    },
    {
      id: "chain",
      label: "Réseau Celo (chainId 42220)",
      status: chainId === celo.id ? "pass" : isConnected ? "warn" : "pending",
      detail: isConnected ? `chainId actuel: ${chainId} (attendu: ${celo.id})` : "Connecte un wallet d'abord",
    },
    {
      id: "balance",
      label: "Balance lisible",
      status: balance ? "pass" : isConnected ? "warn" : "pending",
      detail: balance
        ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
        : isConnected ? "Balance null (peut être normal en testnet)" : "—",
    },
    {
      id: "modeToggle",
      label: "ModeToggle forcé en on-chain dans MiniPay",
      status: contextMiniPay ? (modeToggle === "onchain" ? "pass" : "warn") : "pending",
      detail: contextMiniPay
        ? `mode actuel: ${modeToggle} (devrait être 'onchain')`
        : "Non applicable hors MiniPay",
    },
    {
      id: "gameModeToggle",
      label: "GameModeToggle forcé en on-chain dans MiniPay",
      status: contextMiniPay ? (gameModeToggle === "onchain" ? "pass" : "warn") : "pending",
      detail: contextMiniPay
        ? `mode actuel: ${gameModeToggle} (devrait être 'onchain')`
        : "Non applicable hors MiniPay",
    },
  ];

  const passed = checks.filter((c) => c.status === "pass").length;
  const failed = checks.filter((c) => c.status === "fail").length;
  const warned = checks.filter((c) => c.status === "warn").length;

  return (
    <main className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-xl mx-auto pb-20">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="text-gray-400 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-sm transition-all"
          >
            ← Portal
          </Link>
          <div>
            <h1 className="text-white font-black text-xl">Test MiniPay</h1>
            <p className="text-gray-500 text-xs">Diagnostic de l'intégration wallet</p>
          </div>
        </div>

        {/* Score global */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 mb-4 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-green-400 font-black text-2xl">{passed}</p>
              <p className="text-gray-500 text-[10px] uppercase">Pass</p>
            </div>
            <div className="text-center">
              <p className="text-red-400 font-black text-2xl">{failed}</p>
              <p className="text-gray-500 text-[10px] uppercase">Fail</p>
            </div>
            <div className="text-center">
              <p className="text-yellow-400 font-black text-2xl">{warned}</p>
              <p className="text-gray-500 text-[10px] uppercase">Warn</p>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
            failed === 0 && contextMiniPay
              ? "bg-green-900/30 border-green-500/40 text-green-300"
              : failed > 0
              ? "bg-red-900/30 border-red-500/40 text-red-300"
              : "bg-gray-800 border-gray-600 text-gray-400"
          }`}>
            {failed === 0 && contextMiniPay ? "✅ MiniPay prêt" : failed > 0 ? "❌ Erreurs" : "⏳ Hors MiniPay"}
          </div>
        </div>

        {/* Simulation */}
        <Section title="🔧 Simulation MiniPay (navigateur)">
          <p className="text-gray-400 text-xs mb-3">
            Simule <code className="text-yellow-400">window.ethereum.isMiniPay = true</code> pour tester sans téléphone.
            La page se recharge automatiquement après activation.
          </p>
          <div className="flex gap-2">
            <button
              onClick={activateSimulation}
              disabled={simActive || detectMiniPay()}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all
                bg-green-600 hover:bg-green-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {detectMiniPay() ? "✅ Simulation active" : "▶ Activer simulation"}
            </button>
            <button
              onClick={deactivateSimulation}
              disabled={!detectMiniPay()}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all
                bg-red-800 hover:bg-red-700 text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ⏹ Désactiver
            </button>
          </div>
          {detectMiniPay() && (
            <p className="text-green-400 text-xs mt-2 text-center font-semibold">
              📱 Simulation active — le portail se comporte comme dans MiniPay
            </p>
          )}
        </Section>

        {/* Checks */}
        <Section title="📋 Checklist d'intégration">
          {checks.map((c) => <Row key={c.id} item={c} />)}
        </Section>

        {/* Connexion manuelle */}
        <Section title="🔌 Connexion wallet">
          {isConnected ? (
            <div className="space-y-2">
              <div className="bg-white/5 rounded-xl p-3 text-xs font-mono text-gray-300 break-all">
                {address}
              </div>
              <div className="flex gap-2 text-xs text-gray-500">
                <span>Connector: <span className="text-white">{connector?.name}</span></span>
                <span>·</span>
                <span>Chain: <span className={chainId === celo.id ? "text-green-400" : "text-yellow-400"}>{chainId}</span></span>
              </div>
              <button
                onClick={() => disconnect()}
                className="w-full py-2 rounded-xl text-sm font-bold bg-red-900/40 border border-red-500/30 text-red-300 hover:bg-red-900/60 transition-all"
              >
                Déconnecter
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <WalletConnect />
              {detectMiniPay() && !isConnected && (
                <button
                  onClick={() => connect({ connector: injected() })}
                  disabled={isConnecting}
                  className="w-full py-2.5 rounded-xl text-sm font-bold bg-green-700 hover:bg-green-600 text-white transition-all disabled:opacity-40"
                >
                  {isConnecting ? "Connexion…" : "📱 Connecter MiniPay (injected)"}
                </button>
              )}
            </div>
          )}
        </Section>

        {/* Composants UI */}
        <Section title="🧩 Composants UI en conditions MiniPay">
          <div className="space-y-4">
            <div>
              <p className="text-gray-500 text-[10px] uppercase mb-2">ModeToggle (jeux simples)</p>
              <ModeToggle mode={modeToggle} onModeChange={setModeToggle} />
              <p className="text-gray-600 text-xs mt-1">
                mode: <span className="text-white">{modeToggle}</span>
                {contextMiniPay && modeToggle !== "onchain" && (
                  <span className="text-yellow-400 ml-2">⚠ devrait être 'onchain'</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px] uppercase mb-2">GameModeToggle (jeux multijoueur)</p>
              <GameModeToggle
                mode={gameModeToggle}
                onModeChange={setGameModeToggle}
                showMultiplayer={true}
              />
              <p className="text-gray-600 text-xs mt-1">
                mode: <span className="text-white">{gameModeToggle}</span>
                {contextMiniPay && gameModeToggle !== "onchain" && (
                  <span className="text-yellow-400 ml-2">⚠ devrait être 'onchain'</span>
                )}
              </p>
            </div>
          </div>
        </Section>

        {/* Log */}
        <Section title="📜 Log temps réel">
          {log.length === 0 ? (
            <p className="text-gray-600 text-xs text-center py-4">Aucun événement — active la simulation pour commencer</p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {log.map((entry, i) => (
                <p key={i} className="text-gray-400 text-xs font-mono leading-relaxed">{entry}</p>
              ))}
            </div>
          )}
        </Section>

        {/* Instructions */}
        <Section title="📖 Comment tester sur vrai MiniPay">
          {[
            { step: "1", text: "Installer MiniPay sur Android ou iOS" },
            { step: "2", text: "Créer un compte (Google + numéro de téléphone)" },
            { step: "3", text: "Appuyer 7× sur le numéro de version → Developer Mode" },
            { step: "4", text: "Activer Testnet dans Developer Settings" },
            { step: "5", text: 'Lancer ngrok : ngrok http 3000' },
            { step: "6", text: 'Coller l\'URL ngrok HTTPS dans "Load Test Page"' },
            { step: "7", text: "La bannière verte MiniPay doit apparaître en haut" },
          ].map(({ step, text }) => (
            <div key={step} className="flex gap-3 py-1.5 border-b border-white/5 last:border-0">
              <span className="font-black text-xs flex-shrink-0 text-yellow-400 w-4">{step}.</span>
              <p className="text-gray-300 text-xs">{text}</p>
            </div>
          ))}
        </Section>

      </div>
    </main>
  );
}
