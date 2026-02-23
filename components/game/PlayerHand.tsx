"use client";

import { motion } from "framer-motion";
import { Card, CardColor, getPlayableCards } from "@/lib/game-engine";
import { UnoCard } from "./UnoCard";
import { useEffect, useRef } from "react";

interface PlayerHandProps {
  cards: Card[];
  onPlayCard: (cardId: string) => void;
  topCard: Card;
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
  saidUno 
}: PlayerHandProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use the game engine's logic for playability
  const playableCards = isCurrentTurn 
    ? getPlayableCards(cards, topCard, currentColor) 
    : [];

  const isCardPlayable = (card: Card) => 
    playableCards.some(c => c.id === card.id);

  // Scroll to end on mount/update if it's my turn? 
  // Maybe just ensure visible.
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col justify-end pointer-events-none pb-safe">
      
      {/* Hint if stuck */}
      {isCurrentTurn && playableCards.length === 0 && (
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="self-center mb-4 bg-black/80 backdrop-blur text-white px-6 py-2 rounded-full text-sm font-bold shadow-xl border border-white/10 pointer-events-auto"
         >
            No playable cards — Tap the deck!
         </motion.div>
      )}

      {/* Cards Container */}
      <div 
        ref={containerRef}
        className="flex items-end justify-start sm:justify-center overflow-x-auto overflow-y-visible px-4 sm:px-8 py-4 pointer-events-auto w-full scrollbar-hide"
        style={{ 
            scrollSnapType: 'x mandatory', 
            WebkitOverflowScrolling: 'touch',
            minHeight: '160px'
        }}
      >
        <div className="flex items-end px-[50vw] sm:px-0"> {/* Spacer for center alignment on mobile scroll */}
            {cards.map((card, index) => {
            const playable = isCardPlayable(card);
            
            return (
                <motion.div
                    key={card.id}
                    layoutId={card.id}
                    className="relative flex-shrink-0 snap-center origin-bottom transition-all duration-200"
                    style={{ 
                        marginLeft: index === 0 ? 0 : '-35px', // Mobile Overlap
                        zIndex: index,
                        marginBottom: playable ? '20px' : '0px',
                    }}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ 
                        y: 0,
                        opacity: playable ? 1 : 0.6,
                        scale: playable ? 1.1 : 1,
                        filter: playable ? 'none' : 'grayscale(0.4) brightness(0.7)',
                    }}
                    whileHover={playable ? { 
                        y: -40, 
                        scale: 1.25, 
                        zIndex: 100,
                        marginLeft: '20px',
                        marginRight: '20px',
                        transition: { duration: 0.2 }
                    } : {}}
                    onClick={() => playable && onPlayCard(card.id)}
                >
                    <UnoCard 
                        card={card} 
                        isPlayable={playable} 
                        size="lg" 
                        disabled={!playable && isCurrentTurn} // Visual disable
                    />
                </motion.div>
            );
            })}
        </div>
      </div>
    </div>
  );
}
