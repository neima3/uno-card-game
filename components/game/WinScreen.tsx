"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@/lib/game-engine";
import { PlayerAvatar } from "./PlayerAvatar";

interface WinScreenProps {
  winner: Player;
  players: Player[];
  onPlayAgain: () => void;
  onExit: () => void;
}

function Confetti() {
  const colors = ["#D32F2F", "#1565C0", "#2E7D32", "#F9A825", "#E91E63", "#9C27B0"];
  const count = 80;
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[60]">
      {Array.from({ length: count }).map((_, i) => {
        const isLeft = i % 2 === 0;
        const startX = isLeft ? -20 : 120;
        const endX = isLeft ? 120 : -20;
        
        return (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              left: `${startX}%`,
              top: -20,
              rotate: 0,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              left: [`${startX}%`, `${endX}%`, `${startX}%`],
              top: "120vh",
              rotate: 720 * (Math.random() > 0.5 ? 1 : -1),
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "linear",
            }}
          >
            <div 
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                transform: `rotate(${Math.random() * 360}deg)`,
                boxShadow: `0 0 10px ${colors[Math.floor(Math.random() * colors.length)]}40`,
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

function VictorySparkles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full"
          initial={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            scale: 0,
            opacity: 0,
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
          style={{
            boxShadow: "0 0 10px rgba(249, 168, 37, 0.8)",
          }}
        />
      ))}
    </div>
  );
}

export function WinScreen({ winner, players, onPlayAgain, onExit }: WinScreenProps) {
  const rankedPlayers = [...players].sort((a, b) => a.hand.length - b.hand.length);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" />
      <Confetti />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-full max-w-lg p-6 sm:p-8 flex flex-col items-center gap-8 relative z-[70]"
      >
        <div className="flex flex-col items-center text-center relative">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
            className="relative mb-6"
          >
            <div 
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1.5"
              style={{
                background: "linear-gradient(135deg, #F9A825, #FFD54F, #F9A825)",
                boxShadow: "0 0 60px rgba(249, 168, 37, 0.5), 0 0 120px rgba(249, 168, 37, 0.3)",
              }}
            >
              <PlayerAvatar 
                displayName={winner.displayName} 
                size="lg" 
                className="w-full h-full text-4xl border-4 border-white/90" 
              />
            </div>
            <VictorySparkles />
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="absolute -top-2 -right-2 text-4xl"
            >
              👑
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h1 
              className="text-5xl sm:text-6xl font-black italic tracking-tight"
              style={{
                background: "linear-gradient(135deg, #FFD54F, #F9A825, #FFD54F)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 4px 30px rgba(249, 168, 37, 0.4)",
              }}
            >
              WINNER!
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-white/60 text-lg font-medium mt-3"
          >
            {winner.displayName} wins the game!
          </motion.p>
        </div>

        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="w-full glass-strong rounded-2xl overflow-hidden border border-white/10"
        >
          <div className="p-1 bg-gradient-to-r from-[#D32F2F]/20 via-[#F9A825]/20 to-[#1565C0]/20" />
          <div className="p-4 space-y-2">
            {rankedPlayers.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                  p.id === winner.id 
                    ? "bg-[#F9A825]/10 border border-[#F9A825]/20" 
                    : "bg-white/5 border border-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`font-mono font-bold w-6 text-center ${
                    i === 0 ? "text-[#F9A825]" : "text-white/40"
                  }`}>
                    #{i + 1}
                  </span>
                  <PlayerAvatar displayName={p.displayName} size="sm" />
                  <span className={p.id === winner.id ? "text-[#F9A825] font-bold" : "text-white"}>
                    {p.displayName}
                  </span>
                </div>
                <div className="text-sm font-mono text-white/60">
                  {p.hand.length === 0 ? (
                    <span className="text-[#F9A825] font-bold">WINNER</span>
                  ) : (
                    `${p.hand.length} cards left`
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row gap-3 w-full"
        >
          <motion.button 
            onClick={onPlayAgain}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-gradient-to-r from-[#D32F2F] to-[#C62828] text-white font-bold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 border border-white/10"
            style={{
              boxShadow: "0 8px 32px rgba(211, 47, 47, 0.3)",
            }}
          >
            <span className="text-xl">🎮</span> 
            <span>Play Again</span>
          </motion.button>
          <motion.button 
            onClick={onExit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 glass-strong text-white font-bold py-4 px-6 rounded-xl border border-white/10 flex items-center justify-center gap-2 hover:border-white/20 transition-colors"
          >
            <span>🏠</span>
            <span>Main Menu</span>
          </motion.button>
        </motion.div>

      </motion.div>
    </motion.div>
  );
}
