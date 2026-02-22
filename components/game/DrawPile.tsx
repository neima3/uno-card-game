"use client";

import { motion } from "framer-motion";

interface DrawPileProps {
  count: number;
  onDraw: () => void;
  canDraw: boolean;
}

export function DrawPile({ count, onDraw, canDraw }: DrawPileProps) {
  const stackLayers = Math.min(4, Math.ceil(count / 15));

  return (
    <motion.button
      whileHover={canDraw ? { scale: 1.05, y: -4 } : {}}
      whileTap={canDraw ? { scale: 0.95 } : {}}
      onClick={canDraw ? onDraw : undefined}
      className={`relative transition-all ${canDraw ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
      disabled={!canDraw}
    >
      {Array.from({ length: stackLayers }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -20, opacity: 0 }}
          animate={{ 
            y: i * -3, 
            x: i * -1,
            opacity: 1 - i * 0.15 
          }}
          transition={{ delay: i * 0.05 }}
          className="absolute w-18 h-26 sm:w-22 sm:h-30 rounded-xl overflow-hidden"
          style={{ 
            zIndex: stackLayers - i,
            width: "72px",
            height: "100px",
          }}
        >
          <div 
            className="w-full h-full rounded-xl"
            style={{
              background: "linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%)",
              border: "2px solid #444",
              boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "url('/card-back.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.9,
              }}
            />
            <div className="absolute inset-2 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/40 via-yellow-500/30 to-green-500/40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span 
                  className="text-white font-black text-xs"
                  style={{ 
                    transform: "rotate(-15deg)",
                    textShadow: "1px 1px 3px rgba(0,0,0,0.5)"
                  }}
                >
                  UNO
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
      
      <div 
        className="relative z-10 rounded-xl overflow-hidden card-shadow"
        style={{
          width: "72px",
          height: "100px",
        }}
      >
        <div 
          className="w-full h-full rounded-xl"
          style={{
            background: "linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%)",
            border: "2px solid #555",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/card-back.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-2 rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/40 via-yellow-500/30 to-green-500/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span 
                className="text-white font-black text-sm"
                style={{ 
                  transform: "rotate(-15deg)",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.5)"
                }}
              >
                UNO
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white/80 text-xs font-medium whitespace-nowrap"
      >
        {count} cards
      </motion.div>

      {canDraw && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{
            boxShadow: [
              "0 0 0 2px rgba(255,255,255,0.1)",
              "0 0 0 3px rgba(255,255,255,0.2)",
              "0 0 0 2px rgba(255,255,255,0.1)",
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </motion.button>
  );
}
