"use client";

import { motion } from "framer-motion";
import { CardColor } from "@/lib/game-engine";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  onSelect: (color: CardColor) => void;
  onClose?: () => void;
}

const colors: { color: CardColor; label: string; bg: string }[] = [
  { color: "red", label: "Red", bg: "bg-red-500" },
  { color: "blue", label: "Blue", bg: "bg-blue-500" },
  { color: "green", label: "Green", bg: "bg-green-500" },
  { color: "yellow", label: "Yellow", bg: "bg-yellow-400" },
];

export function ColorPicker({ onSelect, onClose }: ColorPickerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="relative p-8 rounded-3xl bg-gray-900/95 border border-white/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-white text-center mb-6">
          Choose a Color
        </h3>
        
        <div className="relative w-48 h-48">
          {colors.map((item, index) => {
            const angle = (index * 90 - 45) * (Math.PI / 180);
            const radius = 70;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <motion.button
                key={item.color}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{ scale: 1, x, y }}
                transition={{
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 300,
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onSelect(item.color)}
                className={cn(
                  "absolute w-16 h-16 rounded-full shadow-lg border-4 border-white/30",
                  "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                  "transition-all duration-200 hover:border-white hover:shadow-xl",
                  item.bg
                )}
              >
                <span className="sr-only">{item.label}</span>
              </motion.button>
            );
          })}
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-white/20"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
