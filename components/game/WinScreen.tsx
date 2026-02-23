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
      "#E53935", "#1E88E5", "#43A047", "#FDD835", 
      "#8E24AA", "#FF7043", "#00BCD4", "#FF4081"
    ];
    return Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 10 + 5,
      duration: 3 + Math.random() * 2,
      rotation: Math.random() * 720 - 360,
      shape: Math.random() > 0.5 ? "circle" : "square",
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
            borderRadius: piece.shape === "circle" ? "50%" : "2px",
            boxShadow: `0 0 8px ${piece.color}50`,
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

function PlayerResult({ player, isWinner, rank }: { player: Player; isWinner: boolean; rank: number }) {
  const cardCount = player.hand.length;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * rank }}
      className={`flex items-center gap-3 p-2.5 rounded-xl ${
        isWinner 
          ? "bg-[#FDD835]/20 border border-[#FDD835]/30" 
          : "bg-white/5"
      }`}
    >
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-white/60 text-sm font-bold">
        {rank}
      </div>
      <PlayerAvatar displayName={player.displayName} size="sm" />
      <span className={`flex-1 text-sm font-medium ${isWinner ? "text-[#FDD835]" : "text-white/70"}`}>
        {player.displayName}
      </span>
      <span className="text-white/40 text-sm">
        {cardCount} {cardCount === 1 ? "card" : "cards"}
      </span>
    </motion.div>
  );
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
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.id === winner.id) return -1;
    if (b.id === winner.id) return 1;
    return a.hand.length - b.hand.length;
  });

  return (
    <AnimatePresence>
      {show && (
        <>
          <Confetti />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-lg p-4"
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
              className="relative w-full max-w-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FDD835]/10 via-transparent to-[#E53935]/10 rounded-3xl blur-2xl" />
              
              <div className="relative bg-gradient-to-b from-[#2a2a3e] to-[#1a1a2e] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
                <motion.div
                  initial={{ scale: 0, y: -20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 15,
                    delay: 0.3,
                  }}
                  className="text-center mb-4"
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, -10, 10, -10, 10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.5,
                    }}
                    className="text-5xl sm:text-6xl inline-block"
                  >
                    🏆
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center mb-4"
                >
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <PlayerAvatar displayName={winner.displayName} size="lg" />
                  </motion.div>
                  
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-2xl sm:text-3xl font-black text-white mt-3"
                    style={{
                      textShadow: "0 0 30px rgba(253,216,53,0.5)",
                    }}
                  >
                    {winner.displayName}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-[#FDD835] text-sm font-bold tracking-widest mt-1"
                  >
                    WINNER!
                  </motion.p>
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200,
                    delay: 0.7,
                  }}
                  className="flex justify-center mb-5"
                >
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FDD835] to-[#FFA000] shadow-lg">
                    <span className="text-gray-900 font-black text-2xl sm:text-3xl">
                      +<AnimatedNumber value={score} />
                    </span>
                    <span className="text-gray-900/70 font-semibold text-sm">pts</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-2 mb-5"
                >
                  {sortedPlayers.map((player, index) => (
                    <PlayerResult 
                      key={player.id} 
                      player={player} 
                      isWinner={player.id === winner.id}
                      rank={index + 1}
                    />
                  ))}
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="flex flex-col gap-2.5"
                >
                  <Button 
                    onClick={onPlayAgain} 
                    size="lg" 
                    className="w-full h-12 bg-white text-gray-900 hover:bg-gray-100 font-bold text-base shadow-lg"
                  >
                    Play Again
                  </Button>
                  <Button 
                    onClick={onExit} 
                    variant="outline" 
                    className="w-full h-11 border-white/15 text-white/70 hover:bg-white/5 hover:text-white font-semibold"
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
