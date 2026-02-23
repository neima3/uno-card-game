"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Player } from "@/lib/game-engine";
import { PlayerAvatar } from "./PlayerAvatar";
import { UnoCard } from "./UnoCard"; // For visual flair

interface WinScreenProps {
  winner: Player;
  players: Player[];
  onPlayAgain: () => void;
  onExit: () => void;
}

// Simple Confetti using DOM elements for performance/simplicity without canvas lib
function Confetti() {
  const count = 50;
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[60]">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 bg-red-500 rounded-sm"
          initial={{
            top: -20,
            left: `${Math.random() * 100}vw`,
            rotate: 0,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            top: "110vh",
            rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
            x: (Math.random() - 0.5) * 200,
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear",
          }}
          style={{
            backgroundColor: ["#D32F2F", "#1565C0", "#2E7D32", "#F9A825"][Math.floor(Math.random() * 4)],
          }}
        />
      ))}
    </div>
  );
}

export function WinScreen({ winner, players, onPlayAgain, onExit }: WinScreenProps) {
  // Sort players by hand size (ascending) - wait, winner has 0 cards usually?
  // Or just rank them.
  const rankedPlayers = [...players].sort((a, b) => a.hand.length - b.hand.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl">
      <Confetti />
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg p-6 flex flex-col items-center gap-8 relative z-[70]"
      >
        {/* Winner Announcement */}
        <div className="flex flex-col items-center text-center">
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="mb-4"
            >
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-600 p-1 shadow-[0_0_50px_rgba(255,215,0,0.5)]">
                    <PlayerAvatar displayName={winner.displayName} size="lg" className="w-full h-full text-4xl border-4 border-white" />
                </div>
            </motion.div>
            
            <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-500 drop-shadow-sm tracking-tight"
            >
                WINNER!
            </motion.h1>
            
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white/60 text-lg font-medium mt-2"
            >
                {winner.displayName} takes the crown
            </motion.p>
        </div>

        {/* Scoreboard */}
        <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="w-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md"
        >
            <div className="p-4 space-y-2">
                {rankedPlayers.map((p, i) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3">
                            <span className="text-white/40 font-mono font-bold w-6">#{i + 1}</span>
                            <PlayerAvatar displayName={p.displayName} size="sm" />
                            <span className={p.id === winner.id ? "text-yellow-400 font-bold" : "text-white"}>
                                {p.displayName}
                            </span>
                        </div>
                        <div className="text-sm font-mono text-white/60">
                            {p.hand.length === 0 ? "WON" : `${p.hand.length} cards left`}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>

        {/* Actions */}
        <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 w-full"
        >
            <button 
                onClick={onPlayAgain}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold py-4 rounded-xl shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2"
            >
                <span>🔄</span> Play Again
            </button>
            <button 
                onClick={onExit}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl backdrop-blur-md transition active:scale-95 border border-white/10"
            >
                Main Menu
            </button>
        </motion.div>

      </motion.div>
    </div>
  );
}
