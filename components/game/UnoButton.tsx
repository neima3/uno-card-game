"use client";

import { motion } from "framer-motion";

interface UnoButtonProps {
  onClick: () => void;
  shouldPulse?: boolean;
}

export function UnoButton({ onClick, shouldPulse = false }: UnoButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={shouldPulse ? {
        scale: [1, 1.1, 1],
        boxShadow: [
          "0 0 0 0 rgba(229, 57, 53, 0.7)",
          "0 0 0 10px rgba(229, 57, 53, 0)",
          "0 0 0 0 rgba(229, 57, 53, 0)"
        ]
      } : {}}
      transition={shouldPulse ? {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      } : {}}
      onClick={(e) => {
        e.stopPropagation(); // Prevent playing card underneath if any
        onClick();
      }}
      className="relative group"
    >
      <div className="relative z-10 bg-gradient-to-br from-[#D32F2F] to-[#B71C1C] text-white font-black italic text-lg px-6 py-2 rounded-full shadow-lg border-2 border-[#FFCDD2] flex items-center gap-2 overflow-hidden">
        <span className="relative z-10 tracking-widest drop-shadow-sm">UNO!</span>
        
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer" />
      </div>
      
      {/* Background Glow */}
      <div className="absolute inset-0 bg-red-500 blur-md opacity-50 group-hover:opacity-100 transition-opacity rounded-full" />
    </motion.button>
  );
}
