"use client";

import { motion, AnimatePresence } from "framer-motion";

interface DrawPileProps {
  count: number;
  onDraw: () => void;
  canDraw: boolean;
}

export function DrawPile({ count, onDraw, canDraw }: DrawPileProps) {
  const visualCount = Math.min(count, 4);
  
  return (
    <div className="relative w-20 h-28 sm:w-24 sm:h-36 lg:w-28 lg:h-44 perspective-1000">
      <motion.button
        onClick={canDraw ? onDraw : undefined}
        disabled={!canDraw}
        whileHover={canDraw ? { scale: 1.05, y: -5 } : {}}
        whileTap={canDraw ? { scale: 0.95 } : {}}
        className="w-full h-full relative cursor-default"
        style={{
          cursor: canDraw ? 'pointer' : 'default',
        }}
      >
        {Array.from({ length: visualCount }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-xl overflow-hidden"
            initial={{ y: 0 }}
            animate={{ 
              y: canDraw ? [0, -3, 0] : 0,
            }}
            transition={{
              duration: 2,
              delay: i * 0.2,
              repeat: canDraw ? Infinity : 0,
              ease: "easeInOut",
            }}
            style={{
              transform: `translateY(${-i * 3}px)`,
              zIndex: visualCount - i,
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-gray-900 via-[#1a1a1a] to-gray-900 border border-white/10">
              <div className="absolute inset-1 rounded-lg border border-white/5" />
            </div>
          </motion.div>
        ))}

        <motion.div 
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{
            transform: `translateY(-${(visualCount) * 3}px)`,
            zIndex: visualCount + 1,
          }}
          animate={canDraw ? {
            boxShadow: [
              "0 0 0px rgba(249, 168, 37, 0)",
              "0 0 30px rgba(249, 168, 37, 0.4)",
              "0 0 0px rgba(249, 168, 37, 0)",
            ],
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div 
            className="w-full h-full bg-gradient-to-br from-gray-900 via-[#1a1a1a] to-gray-900 border-2 border-white/10 relative overflow-hidden"
            style={{
              boxShadow: canDraw 
                ? "0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(249, 168, 37, 0.2)" 
                : "0 4px 16px rgba(0,0,0,0.3)",
            }}
          >
            <div className="absolute inset-2 rounded-lg border border-white/5" />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-[75%] h-[55%] rounded-[50%] relative overflow-hidden"
                style={{
                  background: "conic-gradient(from 0deg, #D32F2F, #F9A825, #2E7D32, #1565C0, #D32F2F)",
                  boxShadow: "0 0 20px rgba(255,255,255,0.1)",
                }}
              >
                <div className="absolute inset-[12%] bg-gradient-to-br from-gray-900 via-[#1a1a1a] to-gray-900 rounded-[50%] flex items-center justify-center border border-white/10">
                  <span 
                    className="text-white font-black italic text-base lg:text-xl tracking-tight"
                    style={{ 
                      textShadow: "1px 1px 0 #F9A825, -1px -1px 0 #D32F2F",
                    }}
                  >
                    UNO
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none" />
          </div>

          <AnimatePresence>
            {canDraw && (
              <motion.div
                initial={{ scale: 0, y: -10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0, y: -10 }}
                className="absolute -top-3 -right-3 bg-gradient-to-br from-[#F9A825] to-[#F57F17] text-black text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg"
                style={{
                  boxShadow: "0 0 20px rgba(249, 168, 37, 0.5)",
                }}
              >
                DRAW
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div 
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 glass-dark px-3 py-1.5 rounded-full border border-white/10"
          animate={canDraw ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-xs font-mono text-white/70 font-medium">
            {count} cards
          </span>
        </motion.div>
      </motion.button>
    </div>
  );
}
