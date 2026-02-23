"use client";

import { motion, AnimatePresence } from "framer-motion";

interface TurnIndicatorProps {
  currentplayerName: string;
  message?: string;
  isAi?: boolean;
  direction?: 1 | -1;
}

export function TurnIndicator({ 
  currentplayerName, 
  message, 
  isAi = false,
  direction = 1 
}: TurnIndicatorProps) {
  const isMyTurn = !!message;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentplayerName}
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full backdrop-blur-md border ${
          isMyTurn 
            ? "bg-[#FDD835]/20 border-[#FDD835]/40" 
            : isAi
              ? "bg-white/5 border-white/10"
              : "bg-white/5 border-white/10"
        }`}
      >
        <motion.div
          animate={isAi ? { rotate: 360 } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-white/60 text-sm"
        >
          {direction === 1 ? "↻" : "↺"}
        </motion.div>

        <div className="flex items-center gap-2">
          {isMyTurn ? (
            <>
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="text-[#FDD835] text-sm sm:text-base font-bold"
                style={{ textShadow: "0 0 10px rgba(253,216,53,0.5)" }}
              >
                YOUR TURN
              </motion.span>
            </>
          ) : isAi ? (
            <div className="flex items-center gap-1.5">
              <span className="text-white/70 text-xs sm:text-sm font-medium">
                {currentplayerName}
              </span>
              <div className="flex gap-0.5">
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  className="text-white/50 text-xs"
                >
                  .
                </motion.span>
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  className="text-white/50 text-xs"
                >
                  .
                </motion.span>
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  className="text-white/50 text-xs"
                >
                  .
                </motion.span>
              </div>
            </div>
          ) : (
            <span className="text-white/70 text-xs sm:text-sm font-medium">
              {currentplayerName}'s turn
            </span>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
