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
      whileTap={{ scale: 0.9 }}
      animate={shouldPulse ? {
        scale: [1, 1.15, 1],
      } : {}}
      transition={shouldPulse ? {
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut",
      } : {}}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="relative group"
    >
      <motion.div
        animate={shouldPulse ? {
          boxShadow: [
            "0 0 0 0 rgba(211, 47, 47, 0.7)",
            "0 0 0 15px rgba(211, 47, 47, 0)",
            "0 0 0 0 rgba(211, 47, 47, 0)",
          ],
        } : {}}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeOut",
        }}
        className="absolute inset-0 rounded-full"
      />
      
      <div 
        className="relative z-10 bg-gradient-to-br from-[#D32F2F] via-[#C62828] to-[#B71C1C] text-white font-black italic text-base lg:text-lg px-5 lg:px-6 py-2 lg:py-2.5 rounded-full shadow-lg border-2 border-[#FFCDD2]/30 flex items-center gap-2 overflow-hidden"
        style={{
          boxShadow: "0 4px 20px rgba(211, 47, 47, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
      >
        <span 
          className="relative z-10 tracking-[0.15em] drop-shadow-sm"
          style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
        >
          UNO!
        </span>
        
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "easeInOut",
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      </div>
      
      <motion.div
        animate={shouldPulse ? {
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.2, 1],
        } : {
          opacity: 0.5,
        }}
        transition={{
          duration: 1,
          repeat: shouldPulse ? Infinity : 0,
          ease: "easeInOut",
        }}
        className="absolute inset-0 bg-[#D32F2F] blur-xl rounded-full pointer-events-none"
      />
    </motion.button>
  );
}
