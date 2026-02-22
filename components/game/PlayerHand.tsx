"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card as GameCard, CardColor, getPlayableCards } from "@/lib/game-engine";
import { UnoCard } from "./UnoCard";
import { useRef } from "react";

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

  const playableCards = isCurrentTurn
    ? getPlayableCards(cards, topCard, currentColor)
    : [];

  const isCardPlayable = (card: GameCard) =>
    playableCards.some((c) => c.id === card.id);

  const totalCards = cards.length;
  const maxSpread = 400;
  const cardWidth = 80;
  const overlap = Math.min(35, maxSpread / Math.max(totalCards, 1));
  const totalWidth = (totalCards - 1) * overlap + cardWidth;
  const startX = -totalWidth / 2;

  const fanAngle = Math.min(3, 40 / Math.max(totalCards, 1));
  const startAngle = -((totalCards - 1) * fanAngle) / 2;

  return (
    <div 
      ref={containerRef}
      className="relative w-full flex justify-center items-end h-36 sm:h-44 overflow-x-auto overflow-y-visible pb-2"
      style={{
        scrollSnapType: "x mandatory",
        WebkitOverflowScrolling: "touch",
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
              initial={{ 
                opacity: 0, 
                y: 150, 
                x: offsetX,
                rotate: -180,
                scale: 0.5 
              }}
              animate={{
                opacity: 1,
                y: 0,
                x: offsetX,
                rotate: angle,
                scale: 1,
              }}
              exit={{ 
                opacity: 0, 
                scale: 0, 
                y: -100,
                transition: { duration: 0.2 }
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                delay: index * 0.02,
              }}
              whileHover={
                isPlayable
                  ? {
                      y: -20,
                      rotate: 0,
                      scale: 1.1,
                      zIndex: 100,
                      transition: { duration: 0.15 },
                    }
                  : {}
              }
              className="absolute origin-bottom cursor-pointer"
              style={{
                zIndex: index,
              }}
            >
              <UnoCard
                card={card}
                onClick={() => onPlayCard(card.id)}
                isPlayable={isPlayable}
                disabled={!isPlayable}
                index={index}
                size="md"
              />
              
              {isPlayable && (
                <motion.div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full"
                  style={{
                    background: `radial-gradient(ellipse, ${
                      card.color === "red" ? "#FF2B2B" :
                      card.color === "blue" ? "#1A8CFF" :
                      card.color === "green" ? "#00CC66" :
                      card.color === "yellow" ? "#FFD700" : "#9B59B6"
                    }80, transparent)`,
                  }}
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 1.5,
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
