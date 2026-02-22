"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
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
  const [pieces, setPieces] = useState<Array<{ id: number; x: number; delay: number; color: string }>>([]);

  useEffect(() => {
    const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-400", "bg-purple-500", "bg-pink-500"];
    const newPieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{ y: -20, x: `${piece.x}vw`, rotate: 0, opacity: 1 }}
          animate={{
            y: "110vh",
            rotate: Math.random() * 720 - 360,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: piece.delay,
            ease: "linear",
          }}
          className={`absolute w-3 h-3 ${piece.color} rounded-sm`}
        />
      ))}
    </div>
  );
}

export function WinScreen({ winner, players, onPlayAgain, onExit }: WinScreenProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 500);
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

  return (
    <AnimatePresence>
      {show && (
        <>
          <Confetti />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 max-w-md w-full mx-4 border border-white/20 shadow-2xl text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                className="text-6xl mb-4"
              >
                🏆
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-black text-white mb-2"
              >
                {winner.displayName} Wins!
              </motion.h2>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-2 mb-6"
              >
                <PlayerAvatar displayName={winner.displayName} size="lg" />
                <span className="text-2xl font-bold text-yellow-400">
                  +{calculateScore(winner)} points
                </span>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col gap-3"
              >
                <Button onClick={onPlayAgain} size="lg" className="w-full">
                  Play Again
                </Button>
                <Button onClick={onExit} variant="outline" className="w-full">
                  Exit to Menu
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
