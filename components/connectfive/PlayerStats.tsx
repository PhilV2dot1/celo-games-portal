"use client";

import { motion } from "framer-motion";
import { PlayerStats as Stats } from "@/hooks/useConnectFive";

interface PlayerStatsProps {
  stats: Stats;
}

export function PlayerStats({ stats }: PlayerStatsProps) {
  const winRate = stats.games > 0 ? ((stats.wins / stats.games) * 100).toFixed(1) : "0.0";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border-2 border-gray-200"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Your Stats</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-3xl font-black text-gray-900">{stats.games}</div>
          <div className="text-sm text-gray-600">Games</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-black text-green-600">{stats.wins}</div>
          <div className="text-sm text-gray-600">Wins</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-black text-red-600">{stats.losses}</div>
          <div className="text-sm text-gray-600">Losses</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-black text-gray-600">{stats.draws}</div>
          <div className="text-sm text-gray-600">Draws</div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 text-center">
        <div className="text-2xl font-black text-blue-600">{winRate}%</div>
        <div className="text-sm text-gray-600">Win Rate</div>
      </div>
    </motion.div>
  );
}
