"use client";

import { motion } from "framer-motion";

interface DrawPileProps {
  count: number;
  onDraw: () => void;
  canDraw: boolean;
}

export function DrawPile({ count, onDraw, canDraw }: DrawPileProps) {
  const stackLayers = Math.min(5, Math.ceil(count / 10));

  return (
    <motion.button
      whileHover={canDraw ? { scale: 1.05 } : {}}
      whileTap={canDraw ? { scale: 0.95 } : {}}
      onClick={canDraw ? onDraw : undefined}
      className={`relative ${canDraw ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
      disabled={!canDraw}
    >
      {Array.from({ length: stackLayers }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: i * -2, opacity: 1 - i * 0.15 }}
          transition={{ delay: i * 0.1 }}
          className="absolute w-20 h-28 sm:w-24 sm:h-32 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-gray-600"
          style={{ zIndex: stackLayers - i }}
        >
          <div className="absolute inset-2 rounded-lg bg-gradient-to-br from-red-600 via-yellow-500 to-green-600 opacity-80" />
          <div className="absolute inset-3 rounded-md bg-gray-900 flex items-center justify-center">
            <span className="text-white font-black text-sm sm:text-base rotate-[-20deg]">UNO</span>
          </div>
        </motion.div>
      ))}
      
      <div className="relative z-10 w-20 h-28 sm:w-24 sm:h-32 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-gray-600 shadow-xl">
        <div className="absolute inset-2 rounded-lg bg-gradient-to-br from-red-600 via-yellow-500 to-green-600 opacity-80" />
        <div className="absolute inset-3 rounded-md bg-gray-900 flex items-center justify-center">
          <span className="text-white font-black text-sm sm:text-base rotate-[-20deg]">UNO</span>
        </div>
      </div>
      
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-medium">
        {count} cards
      </div>
    </motion.button>
  );
}
