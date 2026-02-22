"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PlayerAvatar } from "./PlayerAvatar";

interface TurnIndicatorProps {
  currentplayerName: string;
  message?: string;
}

export function TurnIndicator({ currentplayerName, message }: TurnIndicatorProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentplayerName}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10"
      >
        <PlayerAvatar displayName={currentplayerName} size="sm" isCurrentTurn />
        <div className="flex flex-col">
          <span className="text-white font-medium text-xs sm:text-sm">
            {currentplayerName}'s Turn
          </span>
          {message && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[var(--uno-yellow)] text-xs font-semibold"
            >
              {message}
            </motion.span>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
