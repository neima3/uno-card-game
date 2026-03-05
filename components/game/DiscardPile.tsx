"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card as GameCard, CardColor } from "@/lib/game-engine";
import { UnoCard } from "./UnoCard";

interface DiscardPileProps {
  cards: GameCard[];
  currentColor: CardColor | null;
}

const colorGradients: Record<string, string> = {
  red: "radial-gradient(circle, rgba(211, 47, 47, 0.4) 0%, transparent 70%)",
  blue: "radial-gradient(circle, rgba(21, 101, 192, 0.4) 0%, transparent 70%)",
  green: "radial-gradient(circle, rgba(46, 125, 50, 0.4) 0%, transparent 70%)",
  yellow: "radial-gradient(circle, rgba(249, 168, 37, 0.4) 0%, transparent 70%)",
};

const colorGlows: Record<string, string> = {
  red: "0 0 60px rgba(211, 47, 47, 0.5), 0 0 120px rgba(211, 47, 47, 0.3)",
  blue: "0 0 60px rgba(21, 101, 192, 0.5), 0 0 120px rgba(21, 101, 192, 0.3)",
  green: "0 0 60px rgba(46, 125, 50, 0.5), 0 0 120px rgba(46, 125, 50, 0.3)",
  yellow: "0 0 60px rgba(249, 168, 37, 0.5), 0 0 120px rgba(249, 168, 37, 0.3)",
};

export function DiscardPile({ cards, currentColor }: DiscardPileProps) {
  const topCard = cards[cards.length - 1];
  const prevCard = cards[cards.length - 2];
  const thirdCard = cards[cards.length - 3];

  return (
    <div className="relative w-24 h-28 sm:w-28 sm:h-36 lg:w-32 lg:h-48 flex items-center justify-center perspective-1000">
      {!topCard && (
        <div className="w-full h-full rounded-xl border-2 border-dashed border-white/15 flex items-center justify-center glass">
          <span className="text-white/20 font-bold text-xs tracking-wider">DISCARD</span>
        </div>
      )}

      {thirdCard && (
        <div 
          className="absolute opacity-30 pointer-events-none"
          style={{
            transform: "rotate(-15deg) scale(0.9) translate(-5px, 5px)",
          }}
        >
          <UnoCard card={thirdCard} size="lg" disabled />
        </div>
      )}

      {prevCard && (
        <div 
          className="absolute opacity-50 pointer-events-none"
          style={{
            transform: "rotate(-8deg) scale(0.95)",
          }}
        >
          <UnoCard card={prevCard} size="lg" disabled />
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {topCard && (
          <motion.div
            key={topCard.id}
            layoutId={topCard.id}
            initial={{ scale: 1.3, y: -80, opacity: 0, rotate: 15 }}
            animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotate: -15 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 25,
              mass: 0.8,
            }}
            className="absolute z-10"
          >
            <UnoCard card={topCard} size="lg" isPlayable={false} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {currentColor && topCard && (
          <motion.div
            key={currentColor}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}
            className="absolute -inset-8 rounded-full pointer-events-none z-0"
            style={{
              background: colorGradients[currentColor] || 'transparent',
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {currentColor && topCard && (
          <motion.div
            key={`glow-${currentColor}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              boxShadow: colorGlows[currentColor] || 'none',
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
