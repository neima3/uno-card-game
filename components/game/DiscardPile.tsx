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
        style={{ width: "60px", height: "85px" }}
      >
        <span className="text-white/20 text-xs">Empty</span>
      </div>
    );
  }

  const style = currentColor && currentColor !== "wild" ? colorStyles[currentColor] : null;

  return (
    <div className="relative">
      {cards.length > 1 && (
        <motion.div 
          initial={{ rotate: 0 }}
          animate={{ rotate: -6 }}
          className="absolute rounded-xl"
          style={{ 
            width: "60px", 
            height: "85px",
            transform: "translateX(4px)",
            background: "linear-gradient(145deg, #2D2D2D 0%, #1A1A1A 100%)",
            border: "1px solid #333",
          }}
        />
      )}
      {cards.length > 2 && (
        <motion.div 
          initial={{ rotate: 0 }}
          animate={{ rotate: 4 }}
          className="absolute rounded-xl"
          style={{ 
            width: "60px", 
            height: "85px",
            transform: "translateX(-3px)",
            background: "linear-gradient(145deg, #2D2D2D 0%, #1A1A1A 100%)",
            border: "1px solid #333",
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
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-2 border-white/50 shadow-lg flex items-center justify-center"
            style={{ 
              backgroundColor: style.bg,
              boxShadow: style.glow,
            }}
          >
            <div className="w-3 h-3 rounded-full bg-white/40" />
          </motion.div>
        )}
      </motion.div>

      {style && topCard.color !== "wild" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
          className="absolute -inset-3 rounded-2xl pointer-events-none"
          style={{
            boxShadow: style.glow,
          }}
        />
      )}
    </div>
  );
}
