"use client";

import { motion } from "framer-motion";
import { Card as GameCard, CardColor } from "@/lib/game-engine";
import { UnoCard } from "./UnoCard";

interface DiscardPileProps {
  cards: GameCard[];
  currentColor: CardColor | null;
}

const colorStyles: Record<string, { bg: string; glow: string }> = {
  red: { bg: "#E53935", glow: "var(--neon-glow-red)" },
  blue: { bg: "#1E88E5", glow: "var(--neon-glow-blue)" },
  green: { bg: "#43A047", glow: "var(--neon-glow-green)" },
  yellow: { bg: "#FDD835", glow: "var(--neon-glow-yellow)" },
};

export function DiscardPile({ cards, currentColor }: DiscardPileProps) {
  const topCard = cards[cards.length - 1];

  if (!topCard) {
    return (
      <div 
        className="rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center"
        style={{ width: "64px", height: "96px" }}
      >
        <span className="text-white/20 text-xs">Empty</span>
      </div>
    );
  }

  const style = currentColor && currentColor !== "wild" ? colorStyles[currentColor] : null;

  return (
    <div className="relative">
      {cards.length > 2 && (
        <motion.div 
          initial={{ rotate: 0 }}
          animate={{ rotate: -8 }}
          className="absolute rounded-xl"
          style={{ 
            width: "64px", 
            height: "96px",
            transform: "translateX(6px) translateY(2px)",
            background: "linear-gradient(145deg, #2D2D2D 0%, #1A1A1A 100%)",
            border: "1px solid #333",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        />
      )}
      {cards.length > 1 && (
        <motion.div 
          initial={{ rotate: 0 }}
          animate={{ rotate: 5 }}
          className="absolute rounded-xl"
          style={{ 
            width: "64px", 
            height: "96px",
            transform: "translateX(-4px) translateY(1px)",
            background: "linear-gradient(145deg, #2D2D2D 0%, #1A1A1A 100%)",
            border: "1px solid #333",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        />
      )}
      
      <motion.div
        key={topCard.id}
        initial={{ scale: 0.5, rotate: 180, opacity: 0, y: -30 }}
        animate={{ scale: 1, rotate: 0, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative"
      >
        <UnoCard card={topCard} disabled showFace />
        
        {currentColor && topCard.color === "wild" && style && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full border-3 border-white/60 shadow-xl flex items-center justify-center"
            style={{ 
              backgroundColor: style.bg,
              boxShadow: style.glow,
            }}
          >
            <motion.div 
              className="w-4 h-4 rounded-full bg-white/50"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        )}
      </motion.div>

      {style && topCard.color !== "wild" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          className="absolute -inset-4 rounded-2xl pointer-events-none"
          style={{
            boxShadow: style.glow,
          }}
        />
      )}
    </div>
  );
}
