"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardColor, getPlayableCards } from "@/lib/game-engine";
import { UnoCard } from "./UnoCard";
import { useRef, useEffect, useState } from "react";

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
  const [isDesktop, setIsDesktop] = useState(false);
  
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);
  
  const playableCards = isCurrentTurn 
    ? getPlayableCards(cards, topCard, currentColor) 
    : [];

  const isCardPlayable = (card: Card) => 
    playableCards.some(c => c.id === card.id);

  const getCardFanStyle = (index: number, total: number, isPlayable: boolean) => {
    if (!isDesktop) {
      return {
        marginLeft: index === 0 ? 0 : '-45px',
        zIndex: index,
      };
    }
    
    const maxSpread = 120;
    const spread = Math.min(maxSpread, total * 8);
    const startAngle = -spread / 2;
    const angleStep = total > 1 ? spread / (total - 1) : 0;
    const angle = startAngle + (angleStep * index);
    
    const maxOffset = 40;
    const yOffset = Math.abs(angle) * 0.3;
    const verticalOffset = maxOffset - yOffset;
    
    return {
      transform: `rotate(${angle * 0.3}deg) translateY(${verticalOffset}px)`,
      marginLeft: index === 0 ? 0 : total > 10 ? '-55px' : '-50px',
      zIndex: isPlayable ? 100 : index,
    };
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col justify-end pointer-events-none pb-safe">
      
      <AnimatePresence>
        {isCurrentTurn && playableCards.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="self-center mb-6 lg:mb-8 glass-strong px-6 py-3 rounded-full text-white text-sm font-bold shadow-xl pointer-events-auto border border-white/10"
          >
            <span className="text-[#F9A825]">No playable cards</span>
            <span className="text-white/60 ml-2">— Draw from deck</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        ref={containerRef}
        className="flex items-end justify-start lg:justify-center overflow-x-auto overflow-y-visible px-2 lg:px-8 py-3 lg:py-4 pointer-events-auto w-full scrollbar-hide"
        style={{ 
          scrollSnapType: 'x mandatory', 
          WebkitOverflowScrolling: 'touch',
          minHeight: isDesktop ? '200px' : '160px',
        }}
      >
        <div 
          className="flex items-end"
          style={{ 
            paddingLeft: isDesktop ? 0 : '10vw',
            paddingRight: isDesktop ? 0 : '10vw',
          }}
        >
          {cards.map((card, index) => {
            const playable = isCardPlayable(card);
            const fanStyle = getCardFanStyle(index, cards.length, playable);
            
            return (
              <motion.div
                key={card.id}
                layoutId={card.id}
                className="relative flex-shrink-0 snap-center origin-bottom"
                style={fanStyle}
                initial={{ y: 100, opacity: 0, rotate: -10 }}
                animate={{ 
                  y: playable ? -20 : 0,
                  opacity: playable ? 1 : 0.65,
                  scale: playable ? 1.08 : 1,
                  filter: playable ? 'none' : 'grayscale(0.3) brightness(0.8)',
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}
                whileHover={playable ? { 
                  y: -60,
                  scale: 1.2, 
                  zIndex: 200,
                  transition: { duration: 0.15 }
                } : {}}
                whileTap={playable ? { scale: 1.1 } : {}}
                onClick={() => playable && onPlayCard(card.id)}
              >
                <UnoCard 
                  card={card} 
                  isPlayable={playable} 
                  size={isDesktop ? "xl" : "lg"} 
                  disabled={!playable && isCurrentTurn}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
