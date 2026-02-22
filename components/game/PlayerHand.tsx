"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card as GameCard, CardColor, getPlayableCards } from "@/lib/game-engine";
import { UnoCard } from "./UnoCard";

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
  const playableCards = isCurrentTurn
    ? getPlayableCards(cards, topCard, currentColor)
    : [];

  const isCardPlayable = (card: GameCard) =>
    playableCards.some((c) => c.id === card.id);

  const fanAngle = Math.min(5, 60 / Math.max(cards.length, 1));
  const startAngle = -((cards.length - 1) * fanAngle) / 2;

  return (
    <div className="relative w-full flex justify-center items-end h-32 sm:h-40">
      <AnimatePresence mode="popLayout">
        {cards.map((card, index) => {
          const angle = startAngle + index * fanAngle;
          const offsetX = (index - (cards.length - 1) / 2) * 30;
          const isPlayable = isCurrentTurn && isCardPlayable(card);

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 100, rotate: -180 }}
              animate={{
                opacity: 1,
                y: 0,
                x: offsetX,
                rotate: angle,
                zIndex: index,
              }}
              exit={{ opacity: 0, scale: 0, y: -100 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: index * 0.03,
              }}
              className="absolute origin-bottom"
              style={{
                transform: `translateX(${offsetX}px) rotate(${angle}deg)`,
              }}
            >
              <UnoCard
                card={card}
                onClick={() => onPlayCard(card.id)}
                isPlayable={isPlayable}
                disabled={!isPlayable}
                index={index}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
