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
  // Only show the last N entries
  const visibleEntries = entries.slice(-maxVisible);

  return (
    <div className="flex flex-col items-center gap-1 w-full max-w-sm pointer-events-none">
      <AnimatePresence mode="popLayout">
        {visibleEntries.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="bg-black/40 backdrop-blur-sm border border-white/5 rounded-full px-3 py-1 text-xs text-white/80 font-medium truncate max-w-full shadow-sm"
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
    id: Math.random().toString(36).substring(7),
    message,
    timestamp: Date.now(),
  };
}
