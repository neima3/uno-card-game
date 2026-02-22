"use client";

import { motion } from "framer-motion";
import { Card as GameCard, CardColor } from "@/lib/game-engine";
import { UnoCard } from "./UnoCard";

interface DiscardPileProps {
  cards: GameCard[];
  currentColor: CardColor | null;
}

const colorStyles: Record<string, { bg: string; glow: string }> = {
  red: { bg: "#FF2B2B", glow: "var(--neon-glow-red)" },
  blue: { bg: "#1A8CFF", glow: "var(--neon-glow-blue)" },
  green: { bg: "#00CC66", glow: "var(--neon-glow-green)" },
  yellow: { bg: "#FFD700", glow: "var(--neon-glow-yellow)" },
};

export function DiscardPile({ cards, currentColor }: DiscardPileProps) {
  const topCard = cards[cards.length - 1];

  if (!topCard) {
    return (
      <div 
        className="rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center"
        style={{ width: "72px", height: "100px" }}
      >
        <span className="text-white/20 text-sm">Empty</span>
      </div>
    );
  }

  const style = currentColor ? colorStyles[currentColor] : null;

  return (
    <div className="relative">
      {cards.length > 1 && (
        <div 
          className="absolute rounded-xl bg-white/5"
          style={{ 
            width: "72px", 
            height: "100px",
            transform: "rotate(-8deg) translateX(4px)",
          }}
        />
      )}
      {cards.length > 2 && (
        <div 
          className="absolute rounded-xl bg-white/5"
          style={{ 
            width: "72px", 
            height: "100px",
            transform: "rotate(5deg) translateX(-6px)",
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
        
        {style && topCard.color === "wild" && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
            style={{ 
              backgroundColor: style.bg,
              boxShadow: style.glow,
            }}
          >
            <div className="w-4 h-4 rounded-full bg-white/30" />
          </motion.div>
        )}
      </motion.div>

      {style && topCard.color !== "wild" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -inset-2 rounded-2xl pointer-events-none"
          style={{
            boxShadow: style.glow,
            opacity: 0.3,
          }}
        />
      )}
    </div>
  );
}
