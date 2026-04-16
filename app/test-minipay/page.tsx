"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useConnect, useDisconnect, useBalance, useChainId } from "wagmi";
import { injected } from "wagmi/connectors";
import { celo } from "wagmi/chains";
import Link from "next/link";
import { detectMiniPay } from "@/hooks/useMiniPay";
import { useMiniPayContext } from "@/components/providers";
import { ModeToggle } from "@/components/shared/ModeToggle";
import { GameModeToggle } from "@/components/shared/GameModeToggle";
import { WalletConnect } from "@/components/shared/WalletConnect";

// ─── Constants ────────────────────────────────────────────────────────────────

const SIM_KEY = "__minipay_sim";
const FAKE_ADDRESS = "0x742d35Cc6634C0532925a3b8D4C9C6b9f79E6B1";

// ─── Types ────────────────────────────────────────────────────────────────────

type CheckStatus = "pass" | "fail" | "warn" | "pending";

interface CheckItem {
  id: string;
  label: string;
  status: CheckStatus;
  detail?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: CheckStatus }) {
  const cfg: Record<CheckStatus, { bg: string; icon: string }> = {
    pass:    { bg: "bg-green-400",                     icon: "✓" },
    fail:    { bg: "bg-red-400",                       icon: "✗" },
    warn:    { bg: "bg-yellow-400",                    icon: "⚠" },
    pending: { bg: "bg-gray-500 animate-pulse",        icon: "…" },
  };
  const { bg, icon } = cfg[status];
  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-black text-gray-900 flex-shrink-0 ${bg}`}>
      {icon}
    </span>
  );
}

function Row({ item }: { item: CheckItem }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
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

// ─── Inject fake MiniPay provider into window.ethereum ───────────────────────
// Called at mount when sessionStorage flag is set — overrides Rabby/MetaMask.

function injectFakeProvider(addLog: (m: string) => void) {
  if (typeof window === "undefined") return;

  const fakeProvider = {
    isMiniPay: true,
    isMetaMask: false,
    selectedAddress: FAKE_ADDRESS,
    chainId: "0xa4ec",
    request: async ({ method }: { method: string; params?: unknown[] }) => {
      addLog(`📡 eth RPC: ${method}`);
      switch (method) {
        case "eth_requestAccounts":
        case "eth_accounts":
          return [FAKE_ADDRESS];
        case "eth_chainId":
          return "0xa4ec"; // Celo = 42220
        case "net_version":
          return "42220";
        case "eth_blockNumber":
          return "0x1";
        case "wallet_switchEthereumChain":
          return null;
        case "eth_getBalance":
          return "0x0";
        default:
          return null;
      }
    },
    on: (_: string, __: () => void) => {},
    removeListener: (_: string, __: () => void) => {},
    emit: (_: string) => {},
  };

  // Rabby/MetaMask define window.ethereum as getter-only via Object.defineProperty.
  // A direct assignment throws "Cannot set property ... which has only a getter".
  // We must redefine the property descriptor to make it writable/configurable.
  try {
    Object.defineProperty(window, "ethereum", {
      value: fakeProvider,
      writable: true,
      configurable: true,
    });
    addLog("🔧 Faux provider injecté via Object.defineProperty");
  } catch {
    // Fallback: some environments won't allow even redefining — log and continue
    addLog("⚠ Impossible d'injecter le provider (propriété non reconfigurable)");
  }
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TestMiniPayPage() {
  const { address, isConnected, connector } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { isInMiniPay: contextMiniPay } = useMiniPayContext();
  const [modeToggle, setModeToggle]       = useState<"free" | "onchain">("free");
  const [gameModeToggle, setGameModeToggle] = useState<"free" | "onchain" | "multiplayer">("free");
  const [log, setLog] = useState<string[]>([]);

  // Derived — reads sessionStorage flag (survives reload)
  const [simActive, setSimActive] = useState(false);

  const addLog = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString("fr-FR", {
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
    setLog((prev) => [`[${ts}] ${msg}`, ...prev.slice(0, 49)]);
  }, []);

  // On mount: read sessionStorage flag + re-inject provider if simulation is active
  useEffect(() => {
    const active = sessionStorage.getItem(SIM_KEY) === "1";
    setSimActive(active);
    if (active) {
      injectFakeProvider(addLog);
      addLog("📱 Simulation persistée — provider réinjecté après rechargement");
    }
  }, [addLog]);

  // Track wallet events
  useEffect(() => {
    if (isConnected && address) addLog(`✅ Wallet connecté: ${address.slice(0, 10)}…`);
  }, [isConnected, address, addLog]);

  useEffect(() => {
    if (contextMiniPay) addLog("📱 MiniPayContext = true");
  }, [contextMiniPay, addLog]);

  // ── Activate simulation ───────────────────────────────────────────────────
  function activateSimulation() {
    sessionStorage.setItem(SIM_KEY, "1");
    addLog("🔧 Flag sessionStorage posé — rechargement…");
    setTimeout(() => window.location.reload(), 400);
  }

  function deactivateSimulation() {
    sessionStorage.removeItem(SIM_KEY);
    addLog("🔧 Flag sessionStorage supprimé — rechargement…");
    setTimeout(() => window.location.reload(), 400);
  }

  // ── Checks ────────────────────────────────────────────────────────────────
  const isMiniPayFlag = typeof window !== "undefined" && window.ethereum?.isMiniPay === true;
  const simFlag       = typeof window !== "undefined" && sessionStorage.getItem(SIM_KEY) === "1";

  const checks: CheckItem[] = [
    {
      id: "ethereum",
      label: "window.ethereum présent",
      status: typeof window !== "undefined" && window.ethereum ? "pass" : "fail",
      detail: typeof window !== "undefined" && window.ethereum
        ? `isMiniPay=${String(window.ethereum.isMiniPay)} · ${Object.keys(window.ethereum).slice(0,5).join(", ")}…`
        : "window.ethereum est undefined",
    },
    {
      id: "isMiniPay",
      label: "window.ethereum.isMiniPay === true",
      status: isMiniPayFlag ? "pass" : simFlag ? "warn" : "fail",
      detail: isMiniPayFlag
        ? "Détecté sur le provider actuel ✓"
        : simFlag
        ? "Flag sessionStorage actif mais provider pas encore réinjecté — recharge la page"
        : `isMiniPay = ${String(typeof window !== "undefined" ? window.ethereum?.isMiniPay : "SSR")}`,
    },
    {
      id: "detectFn",
      label: "detectMiniPay() retourne true",
      status: detectMiniPay() ? "pass" : "fail",
      detail: `detectMiniPay() = ${String(detectMiniPay())} (vérifie window.ethereum.isMiniPay + sessionStorage)`,
    },
    {
      id: "context",
      label: "MiniPayContext propagé dans l'app",
      status: contextMiniPay ? "pass" : detectMiniPay() ? "warn" : "fail",
      detail: contextMiniPay
        ? "useMiniPayContext().isInMiniPay = true ✓"
        : detectMiniPay()
        ? "detectMiniPay()=true mais contexte pas encore propagé — providers.tsx détecte au montage"
        : "useMiniPayContext().isInMiniPay = false",
    },
    {
      id: "wallet",
      label: "Wallet auto-connecté",
      status: isConnected ? "pass" : contextMiniPay ? "warn" : "fail",
      detail: isConnected
        ? `${address?.slice(0,6)}…${address?.slice(-4)} via ${connector?.name}`
        : contextMiniPay
        ? "MiniPay détecté — cliquer 'Connecter MiniPay' ci-dessous"
        : "Non connecté",
    },
    {
      id: "chain",
      label: "Réseau Celo (chainId 42220)",
      status: chainId === celo.id ? "pass" : isConnected ? "warn" : "pending",
      detail: isConnected
        ? `chainId: ${chainId} (attendu: ${celo.id})`
        : "Connecte un wallet d'abord",
    },
    {
      id: "balance",
      label: "Balance lisible",
      status: "pending",
      detail: isConnected ? "Simulation: balance = 0 (pas de vrai RPC)" : "—",
    },
    {
      id: "modeToggle",
      label: "ModeToggle → badge MiniPay · On-Chain",
      status: contextMiniPay
        ? (modeToggle === "onchain" ? "pass" : "warn")
        : "pending",
      detail: contextMiniPay
        ? `mode: ${modeToggle}${modeToggle !== "onchain" ? " ⚠ devrait être 'onchain'" : " ✓"}`
        : "Non applicable hors MiniPay",
    },
    {
      id: "gameModeToggle",
      label: "GameModeToggle → badge MiniPay · On-Chain",
      status: contextMiniPay
        ? (gameModeToggle === "onchain" ? "pass" : "warn")
        : "pending",
      detail: contextMiniPay
        ? `mode: ${gameModeToggle}${gameModeToggle !== "onchain" ? " ⚠ devrait être 'onchain'" : " ✓"}`
        : "Non applicable hors MiniPay",
    },
  ];

  const passed  = checks.filter((c) => c.status === "pass").length;
  const failed  = checks.filter((c) => c.status === "fail").length;
  const warned  = checks.filter((c) => c.status === "warn").length;
  const pending = checks.filter((c) => c.status === "pending").length;

  const globalStatus = contextMiniPay && failed === 0
    ? { label: "✅ MiniPay prêt",    cls: "bg-green-900/30 border-green-500/40 text-green-300" }
    : failed > 2
    ? { label: "❌ Simulation OFF",  cls: "bg-red-900/30 border-red-500/40 text-red-300" }
    : { label: "⏳ En cours…",       cls: "bg-gray-800 border-gray-600 text-gray-400" };

  return (
    <main className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-xl mx-auto pb-20">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
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
          <div className="flex gap-5">
            {[
              { label: "Pass",    value: passed,  color: "text-green-400"  },
              { label: "Fail",    value: failed,  color: "text-red-400"    },
              { label: "Warn",    value: warned,  color: "text-yellow-400" },
              { label: "Pending", value: pending, color: "text-gray-500"   },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className={`font-black text-2xl ${color}`}>{value}</p>
                <p className="text-gray-600 text-[10px] uppercase">{label}</p>
              </div>
            ))}
          </div>
          <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${globalStatus.cls}`}>
            {globalStatus.label}
          </div>
        </div>

        {/* Simulation */}
        <Section title="🔧 Simulation MiniPay (navigateur)">
          <p className="text-gray-400 text-xs mb-3">
            Pose un flag <code className="text-yellow-400 bg-yellow-400/10 px-1 rounded">sessionStorage.__minipay_sim</code> qui
            survit au rechargement, puis réinjecte un faux provider dans <code className="text-yellow-400 bg-yellow-400/10 px-1 rounded">window.ethereum</code>.
          </p>
          <div className="flex gap-2">
            <button
              onClick={activateSimulation}
              disabled={simActive}
              className="flex-1 py-3 rounded-xl text-sm font-bold transition-all
                bg-green-600 hover:bg-green-500 text-white
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {simActive ? "✅ Simulation active" : "▶ Activer simulation"}
            </button>
            <button
              onClick={deactivateSimulation}
              disabled={!simActive}
              className="flex-1 py-3 rounded-xl text-sm font-bold transition-all
                bg-red-800 hover:bg-red-700 text-white
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ⏹ Désactiver
            </button>
          </div>
          {simActive && (
            <div className="mt-3 p-3 rounded-xl bg-green-900/20 border border-green-500/20 text-xs text-green-300 space-y-1">
              <p className="font-bold">📱 Simulation active</p>
              <p className="text-gray-400">Fausse adresse : <span className="font-mono text-white">{FAKE_ADDRESS.slice(0,10)}…</span></p>
              <p className="text-gray-400">Chain simulée : Celo (42220)</p>
            </div>
          )}
        </Section>

        {/* Checklist */}
        <Section title="📋 Checklist d'intégration">
          {checks.map((c) => <Row key={c.id} item={c} />)}
        </Section>

        {/* Connexion wallet */}
        <Section title="🔌 Connexion wallet">
          {isConnected ? (
            <div className="space-y-3">
              <div className="bg-white/5 rounded-xl p-3 space-y-1">
                <p className="text-white text-xs font-mono break-all">{address}</p>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span>Via: <span className="text-white">{connector?.name}</span></span>
                  <span>·</span>
                  <span>Chain: <span className={chainId === celo.id ? "text-green-400" : "text-yellow-400"}>{chainId}</span></span>
                </div>
              </div>
              <button
                onClick={() => { disconnect(); addLog("🔌 Déconnexion manuelle"); }}
                className="w-full py-2 rounded-xl text-sm font-bold bg-red-900/40 border border-red-500/30 text-red-300 hover:bg-red-900/60 transition-all"
              >
                Déconnecter
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {simActive ? (
                <button
                  onClick={() => {
                    addLog("🔌 Tentative connexion injected…");
                    connect({ connector: injected() });
                  }}
                  disabled={isConnecting}
                  className="w-full py-3 rounded-xl text-sm font-bold bg-green-700 hover:bg-green-600 text-white transition-all disabled:opacity-40"
                >
                  {isConnecting ? "⏳ Connexion…" : "📱 Connecter MiniPay (injected)"}
                </button>
              ) : (
                <WalletConnect />
              )}
            </div>
          )}
        </Section>

        {/* Composants UI */}
        <Section title="🧩 Aperçu composants en conditions MiniPay">
          <div className="space-y-5">
            <div>
              <p className="text-gray-500 text-[10px] uppercase mb-2">
                ModeToggle — jeux simples (ex: Crypto Higher / Lower)
              </p>
              <ModeToggle mode={modeToggle} onModeChange={setModeToggle} />
              <p className="text-gray-600 text-xs mt-1.5">
                mode actuel: <span className="text-white font-mono">{modeToggle}</span>
                {contextMiniPay && modeToggle !== "onchain" && (
                  <span className="text-yellow-400 ml-2">⚠ devrait être 'onchain'</span>
                )}
                {contextMiniPay && modeToggle === "onchain" && (
                  <span className="text-green-400 ml-2">✓</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px] uppercase mb-2">
                GameModeToggle — jeux multijoueur (ex: Blackjack, RPS, TicTacToe…)
              </p>
              <GameModeToggle
                mode={gameModeToggle}
                onModeChange={setGameModeToggle}
                showMultiplayer={true}
              />
              <p className="text-gray-600 text-xs mt-1.5">
                mode actuel: <span className="text-white font-mono">{gameModeToggle}</span>
                {contextMiniPay && gameModeToggle !== "onchain" && (
                  <span className="text-yellow-400 ml-2">⚠ devrait être 'onchain'</span>
                )}
                {contextMiniPay && gameModeToggle === "onchain" && (
                  <span className="text-green-400 ml-2">✓</span>
                )}
              </p>
            </div>
          </div>
        </Section>

        {/* Log */}
        <Section title="📜 Log temps réel">
          <div className="min-h-[60px] max-h-52 overflow-y-auto space-y-1">
            {log.length === 0 ? (
              <p className="text-gray-600 text-xs text-center py-4">
                Aucun événement — clique "Activer simulation" pour commencer
              </p>
            ) : (
              log.map((entry, i) => (
                <p key={i} className="text-gray-400 text-xs font-mono leading-relaxed">{entry}</p>
              ))
            )}
          </div>
        </Section>

        {/* Instructions vrai appareil */}
        <Section title="📱 Test sur vrai appareil MiniPay">
          {[
            { n: "1", t: "Installer MiniPay sur Android ou iOS" },
            { n: "2", t: "Créer un compte (Google + numéro de téléphone)" },
            { n: "3", t: "Appuyer 7× sur le numéro de version → Developer Mode" },
            { n: "4", t: "Activer 'Testnet' dans Developer Settings" },
            { n: "5", t: "Lancer : npx next dev  (ou npm run dev)" },
            { n: "6", t: "Lancer dans un autre terminal : ngrok http 3000" },
            { n: "7", t: "Copier l'URL HTTPS ngrok (ex: https://abc123.ngrok.io)" },
            { n: "8", t: "Dans MiniPay → Developer Settings → 'Load Test Page' → coller l'URL" },
            { n: "9", t: "La bannière verte MiniPay doit apparaître en haut de page" },
            { n: "10", t: "Naviguer vers /test-minipay pour voir cette checklist en live" },
          ].map(({ n, t }) => (
            <div key={n} className="flex gap-3 py-1.5 border-b border-white/5 last:border-0">
              <span className="font-black text-xs text-yellow-400 flex-shrink-0 w-5 text-right">{n}.</span>
              <p className="text-gray-300 text-xs">{t}</p>
            </div>
          ))}
        </Section>

      </div>
    </main>
  );
}
