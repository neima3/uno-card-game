"use client";

import { motion } from "framer-motion";

interface DrawPileProps {
  count: number;
  onDraw: () => void;
  canDraw: boolean;
}

export function DrawPile({ count, onDraw, canDraw }: DrawPileProps) {
  // We'll show up to 5 cards in the stack visually
  const visualCount = Math.min(count, 5);
  
  return (
    <div className="relative w-20 h-28 sm:w-24 sm:h-36 perspective-1000">
      <motion.button
        onClick={canDraw ? onDraw : undefined}
        disabled={!canDraw}
        whileHover={canDraw ? { scale: 1.05 } : {}}
        whileTap={canDraw ? { scale: 0.95 } : {}}
        className="w-full h-full relative"
      >
         {/* Stack Effect */}
         {Array.from({ length: visualCount }).map((_, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-lg border border-white/10 shadow-sm"
              style={{
                backgroundColor: "#1a1a1a",
                transform: `translateY(${-i * 2}px) translateZ(${-i * 5}px)`,
                zIndex: visualCount - i,
                backgroundImage: "linear-gradient(135deg, #222 25%, #1a1a1a 25%, #1a1a1a 50%, #222 50%, #222 75%, #1a1a1a 75%, #1a1a1a 100%)",
                backgroundSize: "20px 20px"
              }}
            >
               {/* Card Back Design (Simplified for stack) */}
               <div className="absolute inset-1 rounded border-2 border-white/5 opacity-50"></div>
            </div>
         ))}

         {/* Top Card (The actual interactable one) */}
         <div className="absolute inset-0 rounded-lg border-2 border-white bg-[#1a1a1a] flex items-center justify-center shadow-xl"
              style={{
                transform: `translateY(-${(visualCount - 1) * 2}px)`,
                zIndex: visualCount + 1,
                backgroundImage: "radial-gradient(circle, #333 1px, transparent 1px)",
                backgroundSize: "10px 10px"
              }}>
            
            <div className="w-[80%] h-[60%] rounded-[50%] bg-gradient-to-br from-red-600 via-yellow-500 to-blue-600 p-1">
                 <div className="w-full h-full bg-[#1a1a1a] rounded-[50%] flex items-center justify-center">
                    <span className="text-white font-black italic text-xl">UNO</span>
                 </div>
            </div>

            {canDraw && (
              <div className="absolute -top-3 -right-3 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-bounce">
                DRAW
              </div>
            )}
         </div>

         {/* Count Badge */}
         <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-mono text-white/70">
            {count} cards
         </div>
      </motion.button>
    </div>
  );
}
