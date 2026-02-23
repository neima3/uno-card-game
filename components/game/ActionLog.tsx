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

export function ActionLog({ entries, maxVisible = 3 }: ActionLogProps) {
  const visibleEntries = entries.slice(-maxVisible).reverse();

  if (visibleEntries.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 items-center">
      <AnimatePresence mode="popLayout">
        {visibleEntries.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white/70 text-[10px] sm:text-xs font-medium truncate max-w-[200px] sm:max-w-[280px]"
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
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    message,
    timestamp: Date.now(),
  };
}
