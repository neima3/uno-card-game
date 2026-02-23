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
       {/* Direction Arrow */}
       <motion.div
         animate={{ rotate: direction === 1 ? 0 : 180 }}
         transition={{ duration: 0.5 }}
         className="text-white/20 text-4xl font-black leading-none mb-1 select-none"
       >
         ↻
       </motion.div>

       {/* Status Text */}
       <div className={`text-xs font-bold uppercase tracking-widest ${isMyTurn ? 'text-[#F9A825] animate-pulse' : 'text-white/40'}`}>
           {isMyTurn ? "YOUR TURN" : `${currentplayerName}'S TURN`}
       </div>
    </div>
  );
}
