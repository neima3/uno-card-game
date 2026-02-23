"use client";

import { motion } from "framer-motion";
import { Player } from "@/lib/game-engine";
import { PlayerAvatar } from "./PlayerAvatar"; // Assuming this exists or I should check

interface OpponentSlotProps {
  opponent: Player;
  isCurrentTurn: boolean;
}

export function OpponentSlot({ opponent, isCurrentTurn }: OpponentSlotProps) {
  const isUno = opponent.hand.length === 1;

  return (
    <motion.div
      animate={isCurrentTurn ? {
        scale: 1.05,
        borderColor: "rgba(249, 168, 37, 0.8)",
        boxShadow: "0 0 20px rgba(249, 168, 37, 0.2)"
      } : {
        scale: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
        boxShadow: "none"
      }}
      className="relative flex flex-col items-center bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-2 min-w-[80px] sm:min-w-[100px] transition-colors duration-300"
    >
        {/* Avatar & Name */}
        <div className="relative mb-2">
            <PlayerAvatar displayName={opponent.displayName} size="sm" />
            {isCurrentTurn && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border border-black" />
            )}
        </div>
        
        <div className="text-xs font-bold text-white/90 truncate max-w-[80px] text-center">
            {opponent.displayName}
        </div>

        {/* Cards Mini-View */}
        <div className="flex items-center justify-center mt-2 h-6">
            {opponent.hand.slice(0, 5).map((_, i) => (
                <div 
                    key={i} 
                    className="w-4 h-6 bg-red-500 rounded-sm border border-white/20 shadow-sm"
                    style={{ 
                        marginLeft: i > 0 ? -10 : 0,
                        backgroundColor: i % 2 === 0 ? '#D32F2F' : '#1a1a1a', // Fake variety
                        transform: `rotate(${ (i - 2) * 5 }deg)`
                    }}
                />
            ))}
            {opponent.hand.length > 5 && (
                <div className="ml-1 text-[10px] text-white/50">+{opponent.hand.length - 5}</div>
            )}
        </div>

        {/* UNO Badge */}
        {isUno && (
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-lg border border-red-400 rotate-12"
            >
                UNO!
            </motion.div>
        )}

        {/* Status Text */}
        {isCurrentTurn && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#F9A825] text-black text-[9px] font-bold px-2 py-0.5 rounded-full shadow whitespace-nowrap">
                THINKING...
            </div>
        )}
    </motion.div>
  );
}
