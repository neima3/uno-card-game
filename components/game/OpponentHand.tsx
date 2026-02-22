"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OpponentHandProps {
  cardCount: number;
  displayName: string;
  isCurrentTurn: boolean;
  hasSaidUno?: boolean;
}

export function OpponentHand({
  cardCount,
  displayName,
  isCurrentTurn,
  hasSaidUno = false,
}: OpponentHandProps) {
  const maxVisible = 7;
  const visibleCards = Math.min(cardCount, maxVisible);
  const overlap = 12;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "px-3 py-1 rounded-full text-sm font-medium transition-all",
          isCurrentTurn
            ? "bg-yellow-500 text-gray-900 animate-pulse"
            : "bg-white/10 text-white/70"
        )}
      >
        {displayName}
        {cardCount === 1 && !hasSaidUno && (
          <span className="ml-1 text-red-400 font-bold">!</span>
        )}
      </div>
      
      <div className="relative flex items-center h-12">
        {Array.from({ length: visibleCards }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: i * overlap }}
            transition={{ delay: i * 0.05 }}
            className="absolute"
            style={{ zIndex: i }}
          >
            <div className="w-8 h-12 sm:w-10 sm:h-14 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-600 shadow-lg overflow-hidden">
              <div className="absolute inset-1 rounded bg-gradient-to-br from-red-600 via-yellow-500 to-green-600 opacity-70" />
              <div className="absolute inset-1.5 rounded bg-gray-900 flex items-center justify-center">
                <span className="text-white font-black text-[6px] rotate-[-20deg]">UNO</span>
              </div>
            </div>
          </motion.div>
        ))}
        
        {cardCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-3 top-0 w-5 h-5 rounded-full bg-white text-gray-900 text-xs font-bold flex items-center justify-center shadow-lg"
            style={{ left: visibleCards * overlap + 4 }}
          >
            {cardCount}
          </motion.div>
        )}
      </div>
      
      {cardCount === 1 && hasSaidUno && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
          className="text-xs font-bold text-red-400"
        >
          UNO!
        </motion.div>
      )}
    </div>
  );
}
