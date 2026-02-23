"use client";

import { motion } from "framer-motion";
import { CardColor } from "@/lib/game-engine";

interface ColorPickerProps {
  onSelect: (color: CardColor) => void;
  onClose?: () => void;
}

const colors: { color: CardColor; label: string; hex: string; glow: string }[] = [
  { color: "red", label: "Red", hex: "#E53935", glow: "var(--neon-glow-red)" },
  { color: "blue", label: "Blue", hex: "#1E88E5", glow: "var(--neon-glow-blue)" },
  { color: "green", label: "Green", hex: "#43A047", glow: "var(--neon-glow-green)" },
  { color: "yellow", label: "Yellow", hex: "#FDD835", glow: "var(--neon-glow-yellow)" },
];

export function ColorPicker({ onSelect, onClose }: ColorPickerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#2a2a3e] to-[#1a1a2e] border border-white/10 shadow-2xl"
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
        
        <div className="grid grid-cols-2 gap-4 sm:gap-6 w-48 sm:w-64">
          {colors.map((item, index) => (
            <motion.button
              key={item.color}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.15 + index * 0.08,
                type: "spring",
                stiffness: 400,
                damping: 15,
              }}
              whileHover={{ 
                scale: 1.1,
                boxShadow: item.glow,
              }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelect(item.color)}
              className="color-btn aspect-square rounded-2xl border-2 border-white/20 flex flex-col items-center justify-center gap-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
              style={{ backgroundColor: item.hex }}
              aria-label={item.label}
            >
              <span className="text-white font-bold text-base sm:text-lg drop-shadow-md">
                {item.label}
              </span>
            </motion.button>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/30 text-xs text-center mt-6"
        >
          Tap anywhere to cancel
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
