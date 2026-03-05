"use client";

import { motion } from "framer-motion";

interface TurnIndicatorProps {
  currentplayerName: string;
  isMyTurn: boolean;
  direction: 1 | -1;
}

export function TurnIndicator({ currentplayerName, isMyTurn, direction }: TurnIndicatorProps) {
  return (
    <div className="flex flex-col items-center justify-center pointer-events-none">
      <motion.div
        animate={{ 
          rotate: direction === 1 ? 0 : 180,
          scale: isMyTurn ? 1.1 : 1,
        }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
        className="relative mb-2"
      >
        <span className="text-3xl lg:text-4xl font-black text-white/25 select-none block">
          ↻
        </span>
        {isMyTurn && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 text-3xl lg:text-4xl font-black text-[#F9A825]/30 select-none"
            style={{ filter: "blur(4px)" }}
          >
            ↻
          </motion.div>
        )}
      </motion.div>

      <motion.div
        animate={{
          scale: isMyTurn ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 1.5,
          repeat: isMyTurn ? Infinity : 0,
          ease: "easeInOut",
        }}
        className={`text-xs font-bold uppercase tracking-[0.2em] ${
          isMyTurn 
            ? 'text-[#F9A825]' 
            : 'text-white/40'
        }`}
      >
        {isMyTurn ? "YOUR TURN" : `${currentplayerName}'S TURN`}
      </motion.div>
      
      {isMyTurn && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#F9A825] to-transparent mt-1"
        />
      )}
    </div>
  );
}
