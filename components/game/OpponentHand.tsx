"use client";

import { motion } from "framer-motion";

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
  const maxVisible = 5;
  const visibleCards = Math.min(cardCount, maxVisible);
  const overlap = 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-2"
    >
      <div
        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
          isCurrentTurn
            ? "bg-[var(--uno-yellow)] text-gray-900 shadow-lg"
            : "bg-white/10 text-white/70"
        }`}
      >
        <span className="flex items-center gap-2">
          {displayName}
          {cardCount === 1 && !hasSaidUno && (
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-[var(--uno-red)] font-bold"
            >
              !
            </motion.span>
          )}
        </span>
      </div>
      
      <div className="relative flex items-center h-14">
        {Array.from({ length: visibleCards }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: i * overlap }}
            transition={{ delay: i * 0.05 }}
            className="absolute"
            style={{ zIndex: i }}
          >
            <div 
              className="w-8 h-12 sm:w-10 sm:h-14 rounded-lg overflow-hidden card-shadow"
              style={{
                background: "linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%)",
                border: "1px solid #444",
              }}
            >
              <div className="absolute inset-1 rounded bg-gradient-to-br from-red-500/60 via-yellow-500/50 to-green-500/60" />
              <div className="absolute inset-1.5 rounded bg-[var(--bg-deep)] flex items-center justify-center">
                <span 
                  className="text-white font-black text-[7px]"
                  style={{ transform: "rotate(-15deg)" }}
                >
                  UNO
                </span>
              </div>
            </div>
          </motion.div>
        ))}
        
        {cardCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="absolute w-6 h-6 rounded-full bg-white text-gray-900 text-xs font-bold flex items-center justify-center shadow-lg"
            style={{ 
              left: visibleCards * overlap + 8,
            }}
          >
            {cardCount}
          </motion.div>
        )}
      </div>
      
      {cardCount === 1 && hasSaidUno && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ 
            repeat: Infinity, 
            duration: 0.6,
            ease: "easeInOut"
          }}
          className="text-xs font-bold text-[var(--uno-red)] tracking-wider"
          style={{
            textShadow: "0 0 10px var(--uno-red)",
          }}
        >
          UNO!
        </motion.div>
      )}
    </motion.div>
  );
}
