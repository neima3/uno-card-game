"use client";

import { motion } from "framer-motion";
import { CardColor } from "@/lib/game-engine";

interface ColorPickerProps {
  onSelect: (color: CardColor) => void;
  onClose?: () => void;
}

const colors: { color: CardColor; label: string; hex: string; gradient: string }[] = [
  { color: "red", label: "Red", hex: "#D32F2F", gradient: "linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)" },
  { color: "blue", label: "Blue", hex: "#1565C0", gradient: "linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)" },
  { color: "green", label: "Green", hex: "#2E7D32", gradient: "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)" },
  { color: "yellow", label: "Yellow", hex: "#F9A825", gradient: "linear-gradient(135deg, #F9A825 0%, #F57F17 100%)" },
];

export function ColorPicker({ onSelect, onClose }: ColorPickerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl"
      onClick={onClose}
    >
      <div className="flex flex-col items-center gap-8 w-full max-w-md px-6">
        <h2 className="text-3xl font-black text-white drop-shadow-lg tracking-tight">
            CHOOSE A COLOR
        </h2>
        
        <div className="grid grid-cols-2 gap-6 w-full aspect-square max-w-[300px]">
          {colors.map((item, index) => (
            <motion.button
              key={item.color}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.1 * index,
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(item.color);
              }}
              className="w-full h-full rounded-full shadow-2xl relative overflow-hidden group"
              style={{ background: item.gradient }}
            >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                <span className="sr-only">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
