"use client";

import { motion } from "framer-motion";
import { PlayerStats as Stats } from "@/hooks/useSnake";

interface PlayerStatsProps {
  stats: Stats;
}

export function PlayerStats({ stats }: PlayerStatsProps) {
  const avgScore =
    stats.games > 0 ? Math.round(stats.totalScore / stats.games) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg border-2 border-gray-300"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
        Your Stats
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-3xl font-black text-gray-900">{stats.games}</div>
          <div className="text-sm text-gray-600">Games Played</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-black text-yellow-600">
            {stats.highScore}
          </div>
          <div className="text-sm text-gray-600">High Score</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-black text-blue-600">{avgScore}</div>
          <div className="text-sm text-gray-600">Avg Score</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-black text-green-600">
            {stats.totalFood}
          </div>
          <div className="text-sm text-gray-600">Total Food</div>
        </div>
      </div>
    </motion.div>
  );
}
