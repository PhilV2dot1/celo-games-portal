"use client";

import { motion } from "framer-motion";
import { GameResult } from "@/hooks/useConnectFive";

interface GameStatusProps {
  message: string;
  result: GameResult;
}

export function GameStatus({ message, result }: GameStatusProps) {
  const getStatusColor = () => {
    if (result === "win") return "from-green-500 to-green-600";
    if (result === "lose") return "from-red-500 to-red-600";
    if (result === "draw") return "from-gray-500 to-gray-600";
    return "from-blue-500 to-blue-600";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r ${getStatusColor()} text-white rounded-xl p-4 shadow-lg text-center font-bold`}
    >
      {message}
    </motion.div>
  );
}
