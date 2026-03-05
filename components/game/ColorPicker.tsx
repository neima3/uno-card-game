"use client";

import { motion } from "framer-motion";
import { CardColor } from "@/lib/game-engine";

interface ColorPickerProps {
  onSelect: (color: CardColor) => void;
  onClose?: () => void;
}

const colors: { color: CardColor; label: string; gradient: string; glow: string }[] = [
  { 
    color: "red", 
    label: "Red", 
    gradient: "linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)",
    glow: "0 0 40px rgba(211, 47, 47, 0.6), 0 0 80px rgba(211, 47, 47, 0.3)",
  },
  { 
    color: "blue", 
    label: "Blue", 
    gradient: "linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)",
    glow: "0 0 40px rgba(21, 101, 192, 0.6), 0 0 80px rgba(21, 101, 192, 0.3)",
  },
  { 
    color: "green", 
    label: "Green", 
    gradient: "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)",
    glow: "0 0 40px rgba(46, 125, 50, 0.6), 0 0 80px rgba(46, 125, 50, 0.3)",
  },
  { 
    color: "yellow", 
    label: "Yellow", 
    gradient: "linear-gradient(135deg, #F9A825 0%, #F57F17 100%)",
    glow: "0 0 40px rgba(249, 168, 37, 0.6), 0 0 80px rgba(249, 168, 37, 0.3)",
  },
];

export function ColorPicker({ onSelect, onClose }: ColorPickerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" />
      
      <div className="relative flex flex-col items-center gap-10 w-full max-w-md px-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
            CHOOSE A COLOR
          </h2>
          <p className="text-white/40 text-sm font-medium">
            Select the color for the next play
          </p>
        </motion.div>
        
        <div className="relative w-64 h-64 sm:w-72 sm:h-72">
          {colors.map((item, index) => {
            const angle = (index * 90 - 45) * (Math.PI / 180);
            const radius = 85;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            return (
              <motion.button
                key={item.color}
                initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1, 
                  x: x,
                  y: y,
                }}
                transition={{
                  delay: 0.15 + index * 0.08,
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                }}
                whileHover={{ 
                  scale: 1.15,
                  filter: "brightness(1.2)",
                }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(item.color);
                }}
                className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full shadow-2xl overflow-hidden group left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ 
                  background: item.gradient,
                  boxShadow: item.glow,
                }}
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-25 transition-opacity duration-200" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: [
                      `inset 0 0 0 3px rgba(255,255,255,0.2)`,
                      `inset 0 0 0 3px rgba(255,255,255,0.4)`,
                      `inset 0 0 0 3px rgba(255,255,255,0.2)`,
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.3,
                  }}
                />
                
                <span className="sr-only">{item.label}</span>
              </motion.button>
            );
          })}
          
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full glass-strong border border-white/20 flex items-center justify-center"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
          </motion.div>
        </div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-4"
        >
          {colors.map((item) => (
            <button
              key={`label-${item.color}`}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(item.color);
              }}
              className="px-4 py-2 rounded-full glass border border-white/10 text-white/60 text-xs font-bold hover:text-white hover:border-white/20 transition-all"
            >
              {item.label}
            </button>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
