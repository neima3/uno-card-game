"use client";

import { motion } from "framer-motion";
import { Card as GameCard } from "@/lib/game-engine";
import { UnoCard } from "./UnoCard";

interface DiscardPileProps {
  cards: GameCard[];
  currentColor: string | null;
}

export function DiscardPile({ cards, currentColor }: DiscardPileProps) {
  const topCard = cards[cards.length - 1];

  if (!topCard) {
    return (
      <div className="w-20 h-28 sm:w-24 sm:h-32 rounded-xl border-2 border-dashed border-white/30 flex items-center justify-center">
        <span className="text-white/30 text-sm">Empty</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {cards.length > 1 && (
        <div className="absolute inset-0 -rotate-6 translate-x-1">
          <div className="w-20 h-28 sm:w-24 sm:h-32 rounded-xl bg-gray-700/50" />
        </div>
      )}
      {cards.length > 2 && (
        <div className="absolute inset-0 rotate-3 -translate-x-2">
          <div className="w-20 h-28 sm:w-24 sm:h-32 rounded-xl bg-gray-700/30" />
        </div>
      )}
      
      <motion.div
        key={topCard.id}
        initial={{ scale: 0.5, rotate: 180, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <UnoCard card={topCard} disabled />
      </motion.div>
      
      {currentColor && topCard.color === "wild" && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            "absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white shadow-lg",
            currentColor === "red" && "bg-red-500",
            currentColor === "blue" && "bg-blue-500",
            currentColor === "green" && "bg-green-500",
            currentColor === "yellow" && "bg-yellow-400"
          )}
        />
      )}
    </div>
  );
}

import { cn } from "@/lib/utils";
