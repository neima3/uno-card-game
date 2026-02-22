"use client";

import { motion } from "framer-motion";
import { CardColor } from "@/lib/game-engine";

interface ColorPickerProps {
  onSelect: (color: CardColor) => void;
  onClose?: () => void;
}

const colors: { color: CardColor; label: string; hex: string; glow: string }[] = [
  { color: "red", label: "Red", hex: "#FF2B2B", glow: "var(--neon-glow-red)" },
  { color: "blue", label: "Blue", hex: "#1A8CFF", glow: "var(--neon-glow-blue)" },
  { color: "green", label: "Green", hex: "#00CC66", glow: "var(--neon-glow-green)" },
  { color: "yellow", label: "Yellow", hex: "#FFD700", glow: "var(--neon-glow-yellow)" },
];

export function ColorPicker({ onSelect, onClose }: ColorPickerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 30 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-mid)] border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.h3
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-xl sm:text-2xl font-bold text-white text-center mb-6"
        >
          Choose a Color
        </motion.h3>
        
        <div className="relative w-52 h-52 sm:w-64 sm:h-64">
          {colors.map((item, index) => {
            const positions = [
              { x: 0, y: -70 },
              { x: 70, y: 0 },
              { x: 0, y: 70 },
              { x: -70, y: 0 },
            ];
            const pos = positions[index];

            return (
              <motion.button
                key={item.color}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{ scale: 1, x: pos.x, y: pos.y }}
                transition={{
                  delay: 0.1 + index * 0.08,
                  type: "spring",
                  stiffness: 400,
                  damping: 15,
                }}
                whileHover={{ 
                  scale: 1.15,
                  boxShadow: item.glow,
                }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onSelect(item.color)}
                className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white/30 transition-all duration-200 hover:border-white left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 focus:outline-none focus:ring-2 focus:ring-white/50"
                style={{ 
                  backgroundColor: item.hex,
                }}
                aria-label={item.label}
              >
                <span className="sr-only">{item.label}</span>
              </motion.button>
            );
          })}
          
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: 0.4,
              type: "spring",
              stiffness: 200,
            }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-white/20 flex items-center justify-center"
          >
            <span className="text-2xl">🌈</span>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/40 text-xs text-center mt-4"
        >
          Click anywhere to cancel
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
