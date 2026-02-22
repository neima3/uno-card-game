"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { Player } from "@/lib/game-engine";
import { Button } from "@/components/ui/button";
import { PlayerAvatar } from "./PlayerAvatar";

interface WinScreenProps {
  winner: Player;
  players: Player[];
  onPlayAgain: () => void;
  onExit: () => void;
}

function Confetti() {
  const pieces = useMemo(() => {
    const colors = [
      "#FF2B2B", "#1A8CFF", "#00CC66", "#FFD700", 
      "#9B59B6", "#FF69B4", "#00CED1", "#FF8C00"
    ];
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      duration: 3 + Math.random() * 2,
      rotation: Math.random() * 720 - 360,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{ 
            y: -20, 
            x: `${piece.x}vw`, 
            rotate: 0, 
            opacity: 1,
            scale: 0,
          }}
          animate={{
            y: "110vh",
            rotate: piece.rotation,
            opacity: [1, 1, 0],
            scale: [0, 1, 1, 0.5],
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="absolute"
          style={{
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            boxShadow: `0 0 10px ${piece.color}50`,
          }}
        />
      ))}
    </div>
  );
}

function AnimatedNumber({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(value * easeOut));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{displayValue}</span>;
}

export function WinScreen({ winner, players, onPlayAgain, onExit }: WinScreenProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const calculateScore = (player: Player): number => {
    let score = 0;
    for (const p of players) {
      if (p.id === player.id) continue;
      for (const card of p.hand) {
        if (card.value === "wild" || card.value === "wild4") {
          score += 50;
        } else if (["skip", "reverse", "draw2"].includes(card.value)) {
          score += 20;
        } else {
          score += parseInt(card.value);
        }
      }
    }
    return score;
  };

  const score = calculateScore(winner);

  return (
    <AnimatePresence>
      {show && (
        <>
          <Confetti />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0, rotate: -10, y: 50 }}
              animate={{ scale: 1, rotate: 0, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 20,
                delay: 0.1,
              }}
              className="relative w-full max-w-md"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--uno-red)]/20 via-transparent to-[var(--uno-blue)]/20 rounded-3xl blur-xl" />
              
              <div className="relative bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-mid)] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 15,
                    delay: 0.3,
                  }}
                  className="text-6xl sm:text-7xl mb-4"
                >
                  🏆
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-2"
                >
                  <PlayerAvatar displayName={winner.displayName} size="lg" />
                </motion.div>

                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-3xl sm:text-4xl font-black text-white mb-3"
                  style={{
                    textShadow: "0 0 30px rgba(255,215,0,0.5)",
                  }}
                >
                  {winner.displayName}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-white/60 text-sm uppercase tracking-widest mb-4"
                >
                  Winner!
                </motion.p>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200,
                    delay: 0.7,
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[var(--uno-yellow)] to-orange-500 mb-6"
                >
                  <span className="text-gray-900 font-bold text-3xl sm:text-4xl">
                    +<AnimatedNumber value={score} />
                  </span>
                  <span className="text-gray-900/70 font-medium text-sm">points</span>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-col gap-3"
                >
                  <Button 
                    onClick={onPlayAgain} 
                    size="lg" 
                    className="w-full h-12 bg-white text-gray-900 hover:bg-gray-100 font-bold text-base"
                  >
                    Play Again
                  </Button>
                  <Button 
                    onClick={onExit} 
                    variant="outline" 
                    className="w-full h-12 border-white/20 text-white hover:bg-white/10 font-semibold"
                  >
                    Main Menu
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
