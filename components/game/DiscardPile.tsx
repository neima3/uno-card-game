"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card as GameCard, CardColor } from "@/lib/game-engine";
import { UnoCard } from "./UnoCard";

interface DiscardPileProps {
  cards: GameCard[];
  currentColor: CardColor | null;
}

export function DiscardPile({ cards, currentColor }: DiscardPileProps) {
  const topCard = cards[cards.length - 1];
  const prevCard = cards[cards.length - 2];

  return (
    <div className="relative w-24 h-36 sm:w-32 sm:h-48 flex items-center justify-center">
      {/* Empty State */}
      {!topCard && (
        <div className="w-full h-full rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center">
           <span className="text-white/20 font-bold">DISCARD</span>
        </div>
      )}

      {/* Previous Card (Peeking) */}
      {prevCard && (
         <div className="absolute inset-0 opacity-60 rotate-[-10deg] scale-95 brightness-50 pointer-events-none">
             <UnoCard card={prevCard} size="lg" disabled />
         </div>
      )}

      {/* Top Card */}
      <AnimatePresence mode="popLayout">
        {topCard && (
          <motion.div
            key={topCard.id}
            layoutId={topCard.id}
            initial={{ scale: 1.2, y: -50, opacity: 0, rotate: 10 }}
            animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute inset-0 z-10"
          >
             <UnoCard card={topCard} size="lg" isPlayable={false} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Color Indicator Glow (Underneath) */}
      <div 
        className="absolute inset-0 rounded-full blur-3xl opacity-40 z-0 pointer-events-none transition-colors duration-500"
        style={{
            backgroundColor: currentColor === 'red' ? '#D32F2F' :
                           currentColor === 'blue' ? '#1565C0' :
                           currentColor === 'green' ? '#2E7D32' :
                           currentColor === 'yellow' ? '#F9A825' : 'transparent'
        }}
      />
    </div>
  );
}
