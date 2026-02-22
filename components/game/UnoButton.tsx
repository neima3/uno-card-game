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
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full bg-red-500"
        />
      )}
      
      <Button
        onClick={onClick}
        disabled={disabled}
        variant="outline"
        className={`
          relative z-10 h-14 px-6 rounded-full font-black text-lg
          bg-gradient-to-br from-red-500 to-red-700 border-4 border-red-400
          hover:from-red-400 hover:to-red-600
          disabled:opacity-50 disabled:cursor-not-allowed
          ${shouldPulse ? "animate-pulse" : ""}
        `}
      >
        <motion.span
          animate={shouldPulse ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: shouldPulse ? Infinity : 0 }}
        >
          UNO!
        </motion.span>
      </Button>
    </motion.div>
  );
}
