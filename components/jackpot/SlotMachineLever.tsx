"use client";

import { motion } from "framer-motion";

interface SlotMachineLeverProps {
  isSpinning: boolean;
  onPull: () => void;
  disabled: boolean;
}

export function SlotMachineLever({ isSpinning, onPull, disabled }: SlotMachineLeverProps) {
  return (
    <div className="absolute -right-6 top-1/2 -translate-y-1/2 z-20">
      <button
        onClick={onPull}
        disabled={disabled}
        className="group relative cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Pull lever to spin"
      >
        {/* Lever Handle (Ball) and Arm */}
        <motion.div
          animate={{
            y: isSpinning ? 50 : 0,
          }}
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
          className="relative"
        >
          {/* Ball/Knob */}
          <div
            className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 border-2 border-gray-800 group-hover:scale-105 group-disabled:group-hover:scale-100 transition-transform relative shadow-md"
            style={{
              boxShadow: '0 0 0 2px #FCFF52, 0 2px 8px rgba(0,0,0,0.3)'
            }}
          >
            {/* Subtle shine */}
            <div className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full opacity-30" />
          </div>

          {/* Lever Arm */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-1.5 h-12 bg-gradient-to-b from-gray-700 to-gray-900 rounded-full shadow-sm" />

          {/* Base */}
          <div className="absolute top-22 left-1/2 -translate-x-1/2 w-4 h-3 bg-gray-800 rounded-sm shadow-sm" />
        </motion.div>
      </button>
    </div>
  );
}
