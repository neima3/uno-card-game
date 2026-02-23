"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card as GameCard, CardColor, getPlayableCards } from "@/lib/game-engine";
import { UnoCard } from "./UnoCard";
import { useRef, useState, useEffect } from "react";

interface PlayerHandProps {
  cards: GameCard[];
  onPlayCard: (cardId: string) => void;
  topCard: GameCard;
  currentColor: CardColor | null;
  isCurrentTurn: boolean;
  saidUno?: boolean;
}

export function PlayerHand({
  cards,
  onPlayCard,
  topCard,
  currentColor,
  isCurrentTurn,
  saidUno = false,
}: PlayerHandProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const playableCards = isCurrentTurn
    ? getPlayableCards(cards, topCard, currentColor)
    : [];

  const isCardPlayable = (card: GameCard) =>
    playableCards.some((c) => c.id === card.id);

  const totalCards = cards.length;
  const maxSpread = 300;
  const cardWidth = 72;
  const overlap = Math.min(36, maxSpread / Math.max(totalCards, 1));
  const totalWidth = (totalCards - 1) * overlap + cardWidth;
  const startX = -totalWidth / 2;

  const fanAngle = Math.min(3, 40 / Math.max(totalCards, 1));
  const startAngle = -((totalCards - 1) * fanAngle) / 2;

  const cardColors: Record<string, string> = {
    red: "#E53935",
    blue: "#1E88E5",
    green: "#43A047",
    yellow: "#FDD835",
    wild: "#8E24AA",
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full flex justify-center items-end h-36 sm:h-44 overflow-x-auto overflow-y-visible pb-2 px-4"
      style={{
        scrollSnapType: "x mandatory",
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-x",
      }}
    >
      <AnimatePresence mode="popLayout">
        {cards.map((card, index) => {
          const angle = startAngle + index * fanAngle;
          const offsetX = startX + index * overlap;
          const isPlayable = isCurrentTurn && isCardPlayable(card);

          return (
            <motion.div
              key={card.id}
              layout
              initial={mounted ? { 
                opacity: 0, 
                y: 120, 
                x: offsetX,
                rotate: -180,
                scale: 0.5 
              } : {
                opacity: 1,
                y: 0,
                x: offsetX,
                rotate: angle,
                scale: 1,
              }}
              animate={{
                opacity: isPlayable ? 1 : 0.6,
                y: 0,
                x: offsetX,
                rotate: angle,
                scale: 1,
              }}
              exit={{ 
                opacity: 0, 
                scale: 0, 
                y: -80,
                transition: { duration: 0.15 }
              }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 28,
                delay: index * 0.02,
              }}
              whileHover={
                isPlayable
                  ? {
                      y: -28,
                      rotate: 0,
                      scale: 1.1,
                      zIndex: 100,
                      transition: { duration: 0.12 },
                    }
                  : {}
              }
              whileTap={isPlayable ? { scale: 0.95 } : {}}
              className="absolute origin-bottom"
              style={{
                zIndex: index,
                filter: isPlayable ? 'none' : 'saturate(0.7)',
              }}
            >
              <UnoCard
                card={card}
                onClick={() => {
                  if (isPlayable) {
                    if (navigator.vibrate) {
                      navigator.vibrate(30);
                    }
                    onPlayCard(card.id);
                  }
                }}
                isPlayable={isPlayable}
                disabled={!isPlayable}
                index={index}
                size="md"
              />
              
              {isPlayable && (
                <motion.div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse, ${cardColors[card.color]}CC, transparent)`,
                  }}
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
