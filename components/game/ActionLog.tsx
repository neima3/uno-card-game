"use client";

import { motion, AnimatePresence } from "framer-motion";

export interface ActionLogEntry {
  id: string;
  message: string;
  timestamp: number;
}

interface ActionLogProps {
  entries: ActionLogEntry[];
  maxVisible?: number;
}

export function ActionLog({ entries, maxVisible = 2 }: ActionLogProps) {
  const visibleEntries = entries.slice(-maxVisible);

  return (
    <div className="flex flex-col items-center gap-1.5 w-full max-w-xs pointer-events-none">
      <AnimatePresence mode="popLayout">
        {visibleEntries.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ 
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
            className="glass-dark px-3 py-1.5 rounded-full text-[11px] text-white/80 font-medium truncate max-w-full shadow-sm border border-white/5"
          >
            {entry.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function createLogEntry(message: string): ActionLogEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
    message,
    timestamp: Date.now(),
  };
}
