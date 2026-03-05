"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@/lib/game-engine";
import { PlayerAvatar } from "./PlayerAvatar";

interface OpponentSlotProps {
  opponent: Player;
  isCurrentTurn: boolean;
  position?: "top" | "left" | "right";
  index?: number;
  total?: number;
}

export function OpponentSlot({ 
  opponent, 
  isCurrentTurn, 
  position = "top",
  index = 0,
  total = 1 
}: OpponentSlotProps) {
  const isUno = opponent.hand.length === 1;

  if (position === "left" || position === "right") {
    return (
      <motion.div
        animate={isCurrentTurn ? {
          scale: 1.02,
          borderColor: "rgba(249, 168, 37, 0.5)",
        } : {
          scale: 1,
          borderColor: "rgba(255, 255, 255, 0.08)",
        }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center glass rounded-2xl border p-4 w-28 transition-all duration-300"
        style={{
          boxShadow: isCurrentTurn 
            ? "0 0 30px rgba(249, 168, 37, 0.15), inset 0 0 20px rgba(249, 168, 37, 0.05)" 
            : "none",
        }}
      >
        <div className="relative mb-3">
          <PlayerAvatar displayName={opponent.displayName} size="md" />
          {isCurrentTurn && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#F9A825] rounded-full border-2 border-[#0a0a12]"
              style={{ boxShadow: "0 0 10px rgba(249, 168, 37, 0.6)" }}
            />
          )}
        </div>
        
        <div className="text-xs font-bold text-white/90 truncate max-w-full text-center mb-3">
          {opponent.displayName}
        </div>

        <div className="flex flex-col items-center gap-0.5">
          {opponent.hand.slice(0, 6).map((_, i) => (
            <div 
              key={i} 
              className="w-8 h-5 rounded border border-white/10"
              style={{ 
                marginTop: i > 0 ? '-12px' : 0,
                backgroundColor: '#1a1a1a',
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                zIndex: i,
              }}
            />
          ))}
          {opponent.hand.length > 6 && (
            <div className="text-[10px] text-white/50 font-medium mt-1">
              +{opponent.hand.length - 6}
            </div>
          )}
        </div>

        <div className="mt-3 text-[11px] font-mono text-white/40">
          {opponent.hand.length} cards
        </div>

        <AnimatePresence>
          {isUno && (
            <motion.div
              initial={{ scale: 0, rotate: -12 }}
              animate={{ scale: 1, rotate: 12 }}
              exit={{ scale: 0 }}
              className="absolute -top-2 -right-2 bg-gradient-to-br from-[#D32F2F] to-[#B71C1C] text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-lg border border-red-400/30"
              style={{ boxShadow: "0 0 15px rgba(211, 47, 47, 0.5)" }}
            >
              UNO!
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isCurrentTurn && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#F9A825] text-black text-[9px] font-bold px-2.5 py-1 rounded-full shadow whitespace-nowrap flex items-center gap-1"
            >
              {opponent.isAi ? (
                <>
                  <span className="inline-flex gap-[2px]">
                    <span className="animate-thinking-dots" style={{ animationDelay: "0ms" }}>●</span>
                    <span className="animate-thinking-dots" style={{ animationDelay: "200ms" }}>●</span>
                    <span className="animate-thinking-dots" style={{ animationDelay: "400ms" }}>●</span>
                  </span>
                  THINKING
                </>
              ) : (
                "PLAYING..."
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={isCurrentTurn ? {
        scale: 1.05,
        borderColor: "rgba(249, 168, 37, 0.5)",
      } : {
        scale: 1,
        borderColor: "rgba(255, 255, 255, 0.08)",
      }}
      transition={{ duration: 0.3 }}
      className="relative flex flex-col items-center glass rounded-2xl border p-2.5 min-w-[85px] sm:min-w-[100px] transition-all duration-300"
      style={{
        boxShadow: isCurrentTurn 
          ? "0 0 25px rgba(249, 168, 37, 0.15)" 
          : "none",
      }}
    >
      <div className="relative mb-2">
        <PlayerAvatar displayName={opponent.displayName} size="sm" />
        {isCurrentTurn && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-3 h-3 bg-[#F9A825] rounded-full animate-pulse border border-[#0a0a12]"
            style={{ boxShadow: "0 0 10px rgba(249, 168, 37, 0.6)" }}
          />
        )}
      </div>
      
      <div className="text-[11px] font-bold text-white/90 truncate max-w-[80px] text-center">
        {opponent.displayName}
      </div>

      <div className="flex items-center justify-center mt-2 h-7">
        {opponent.hand.slice(0, 5).map((_, i) => (
          <div 
            key={i} 
            className="w-5 h-7 rounded border border-white/10"
            style={{ 
              marginLeft: i > 0 ? -12 : 0,
              backgroundColor: '#1a1a1a',
              transform: `rotate(${ (i - 2) * 8 }deg)`,
              boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
              zIndex: i,
            }}
          />
        ))}
        {opponent.hand.length > 5 && (
          <div className="ml-1.5 text-[10px] text-white/50 font-medium">
            +{opponent.hand.length - 5}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isUno && (
          <motion.div
            initial={{ scale: 0, rotate: -12 }}
            animate={{ scale: 1, rotate: 12 }}
            exit={{ scale: 0 }}
            className="absolute -top-2 -right-2 bg-gradient-to-br from-[#D32F2F] to-[#B71C1C] text-white text-[10px] font-black px-1.5 py-0.5 rounded-lg shadow-lg border border-red-400/30"
            style={{ boxShadow: "0 0 15px rgba(211, 47, 47, 0.5)" }}
          >
            UNO!
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCurrentTurn && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#F9A825] text-black text-[9px] font-bold px-2 py-0.5 rounded-full shadow whitespace-nowrap flex items-center gap-1"
          >
            {opponent.isAi ? (
              <>
                <span className="inline-flex gap-[2px]">
                  <span className="animate-thinking-dots" style={{ animationDelay: "0ms" }}>●</span>
                  <span className="animate-thinking-dots" style={{ animationDelay: "200ms" }}>●</span>
                  <span className="animate-thinking-dots" style={{ animationDelay: "400ms" }}>●</span>
                </span>
                THINKING
              </>
            ) : (
              "PLAYING..."
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface OpponentsContainerProps {
  opponents: Player[];
  currentPlayerId: string | null;
  gameState: {
    currentPlayerIndex: number;
    players: Player[];
  };
}

export function OpponentsContainer({ opponents, currentPlayerId, gameState }: OpponentsContainerProps) {
  return (
    <>
      <div className="mobile-only h-28 sm:h-32 flex items-center justify-center gap-2 px-2 overflow-x-auto scrollbar-hide py-2">
        {opponents.map(opp => (
          <OpponentSlot
            key={opp.id}
            opponent={opp}
            isCurrentTurn={gameState.players[gameState.currentPlayerIndex]?.id === opp.id}
            position="top"
          />
        ))}
      </div>

      <div className="desktop-only fixed left-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-30">
        {opponents.slice(0, Math.ceil(opponents.length / 2)).map((opp, i) => (
          <OpponentSlot
            key={opp.id}
            opponent={opp}
            isCurrentTurn={gameState.players[gameState.currentPlayerIndex]?.id === opp.id}
            position="left"
            index={i}
            total={opponents.length}
          />
        ))}
      </div>

      <div className="desktop-only fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-30">
        {opponents.slice(Math.ceil(opponents.length / 2)).map((opp, i) => (
          <OpponentSlot
            key={opp.id}
            opponent={opp}
            isCurrentTurn={gameState.players[gameState.currentPlayerIndex]?.id === opp.id}
            position="right"
            index={i + Math.ceil(opponents.length / 2)}
            total={opponents.length}
          />
        ))}
      </div>
    </>
  );
}
