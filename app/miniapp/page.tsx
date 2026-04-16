"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { detectMiniPay } from "@/hooks/useMiniPay";
import { useMiniPayContext } from "@/components/providers";
import { motion } from "framer-motion";
import Link from "next/link";

const FEATURED_GAMES = [
  { icon: "📊", name: "Crypto Higher / Lower", route: "/games/crypto-higher-lower", desc: "Guess token prices" },
  { icon: "🃏", name: "Blackjack",             route: "/blackjack",                 desc: "Beat the dealer" },
  { icon: "♠️", name: "Poker",                 route: "/games/poker",               desc: "Texas Hold'em" },
  { icon: "🎰", name: "Jackpot",               route: "/jackpot",                   desc: "Spin the wheel" },
  { icon: "🪙", name: "Coin Flip",             route: "/games/coin-flip",           desc: "Double or nothing" },
  { icon: "🎡", name: "Roulette",              route: "/games/roulette",            desc: "Bet on numbers" },
];

export default function MiniAppPage() {
  const router = useRouter();
  const { isInMiniPay } = useMiniPayContext();

  // If already inside MiniPay, redirect straight to the portal home
  useEffect(() => {
    if (detectMiniPay() || isInMiniPay) {
      router.replace("/");
    }
  }, [isInMiniPay, router]);

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col">

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-950 to-green-950 px-6 pt-14 pb-10 text-center">
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-yellow-400/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-green-500/5 blur-3xl" />
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          {/* Logo */}
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/20">
            <span className="text-4xl">🎮</span>
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight mb-2">
            Celo Games Portal
          </h1>
          <p className="text-gray-400 text-base mb-6 max-w-xs mx-auto leading-relaxed">
            27 mini-games on Celo blockchain.<br />
            Free play · On-chain · Multiplayer.
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <span className="flex items-center gap-1.5 bg-green-900/30 border border-green-500/30 text-green-300 text-xs font-bold px-3 py-1.5 rounded-full">
              📱 MiniPay Compatible
            </span>
            <span className="flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-bold px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> Celo Mainnet
            </span>
            <span className="flex items-center gap-1.5 bg-indigo-900/30 border border-indigo-500/30 text-indigo-300 text-xs font-bold px-3 py-1.5 rounded-full">
              🔵 Farcaster Mini App
            </span>
          </div>

          {/* CTA */}
          <Link
            href="/"
            className="inline-block w-full max-w-xs py-4 rounded-2xl font-black text-gray-900 text-lg shadow-lg shadow-yellow-400/20 hover:brightness-105 transition-all"
            style={{ backgroundColor: "#FCFF52" }}
          >
            🎮 Play Now
          </Link>

          <p className="text-gray-600 text-xs mt-4">
            Open in MiniPay for the best experience — wallet auto-connects
          </p>
        </motion.div>
      </div>

      {/* Featured games */}
      <div className="px-6 py-8 flex-1">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 text-center">
          Featured Games
        </p>
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          {FEATURED_GAMES.map((game, i) => (
            <motion.div
              key={game.route}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.3 }}
            >
              <Link
                href={game.route}
                className="block rounded-2xl bg-white/5 border border-white/10 p-4 hover:bg-white/10 transition-all"
              >
                <div className="text-2xl mb-2">{game.icon}</div>
                <p className="text-white font-bold text-sm leading-tight">{game.name}</p>
                <p className="text-gray-500 text-xs mt-0.5">{game.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* How MiniPay works */}
        <div className="mt-8 rounded-2xl bg-green-900/10 border border-green-500/20 p-5 max-w-sm mx-auto">
          <p className="text-green-300 font-bold text-sm mb-3">
            📱 How to open in MiniPay
          </p>
          <div className="space-y-2">
            {[
              "Open MiniPay on your phone",
              'Tap the browser / "Apps" icon',
              "Search for Celo Games Portal",
              "Or paste the URL directly",
            ].map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="text-yellow-400 font-black text-xs w-4 text-right flex-shrink-0">
                  {i + 1}.
                </span>
                <p className="text-gray-300 text-xs">{step}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2 rounded-xl bg-black/30 font-mono text-xs text-gray-400 text-center break-all">
            celo-games-portal.vercel.app
          </div>
        </div>
      </div>
    </main>
  );
}
