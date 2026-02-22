"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface UnoButtonProps {
  onClick: () => void;
  disabled?: boolean;
  shouldPulse?: boolean;
}

export function UnoButton({ onClick, disabled = false, shouldPulse = false }: UnoButtonProps) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="relative"
    >
      {shouldPulse && (
        <>
          <motion.div
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.4, 0, 0.4],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeOut",
            }}
            className="absolute inset-0 rounded-full bg-[var(--uno-red)]"
          />
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.3,
            }}
            className="absolute inset-0 rounded-full bg-[var(--uno-red)]"
          />
        </>
      )}
      
      <Button
        onClick={onClick}
        disabled={disabled}
        className={`
          relative z-10 h-12 sm:h-14 px-6 sm:px-8 rounded-full font-black text-base sm:text-lg
          bg-gradient-to-br from-[var(--uno-red)] to-red-700 
          border-2 border-red-400
          hover:from-red-500 hover:to-red-600
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-lg shadow-red-500/30
          transition-all duration-200
        `}
        style={{
          boxShadow: shouldPulse 
            ? "0 0 20px var(--uno-red), 0 0 40px var(--uno-red)" 
            : undefined,
        }}
      >
        <motion.span
          animate={shouldPulse ? { 
            scale: [1, 1.08, 1],
          } : {}}
          transition={{ 
            duration: 0.4, 
            repeat: shouldPulse ? Infinity : 0,
            ease: "easeInOut"
          }}
          className="tracking-wider"
        >
          UNO!
        </motion.span>
      </Button>
    </motion.div>
  );
}
