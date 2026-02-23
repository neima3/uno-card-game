"use client";

import { motion } from "framer-motion";

interface DrawPileProps {
  count: number;
  onDraw: () => void;
  canDraw: boolean;
}

export function DrawPile({ count, onDraw, canDraw }: DrawPileProps) {
  const stackLayers = Math.min(3, Math.ceil(count / 20));

  return (
    <motion.button
      whileHover={canDraw ? { scale: 1.05, y: -4 } : {}}
      whileTap={canDraw ? { scale: 0.95 } : {}}
      onClick={canDraw ? onDraw : undefined}
      className={`relative transition-all ${canDraw ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
      disabled={!canDraw}
    >
      {Array.from({ length: stackLayers }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -20, opacity: 0 }}
          animate={{ 
            y: i * -2, 
            x: i * -0.5,
            opacity: 1 - i * 0.2 
          }}
          transition={{ delay: i * 0.05 }}
          className="absolute rounded-xl overflow-hidden"
          style={{ 
            zIndex: stackLayers - i,
            width: "60px",
            height: "85px",
          }}
        >
          <div 
            className="w-full h-full rounded-xl card-shadow"
            style={{
              background: "linear-gradient(145deg, #2D2D2D 0%, #1A1A1A 100%)",
              border: "2px solid #444",
            }}
          >
            <div className="absolute inset-[3px] rounded-lg overflow-hidden">
              <div 
                className="absolute inset-0"
                style={{
                  background: "conic-gradient(from 0deg, #E5393530 0deg 90deg, #1E88E530 90deg 180deg, #43A04730 180deg 270deg, #FDD83530 270deg 360deg)",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="flex items-center gap-0.5 opacity-60">
                    <div className="w-2 h-2 rounded-full bg-[#E53935]" />
                    <div className="w-2 h-2 rounded-full bg-[#FDD835]" />
                  </div>
                  <div className="flex items-center gap-0.5 opacity-60 -mt-0.5 ml-1">
                    <div className="w-2 h-2 rounded-full bg-[#1E88E5]" />
                    <div className="w-2 h-2 rounded-full bg-[#43A047]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
      
      <div 
        className="relative z-10 rounded-xl overflow-hidden"
        style={{
          width: "60px",
          height: "85px",
        }}
      >
        <div 
          className="w-full h-full rounded-xl card-shadow"
          style={{
            background: "linear-gradient(145deg, #3D3D3D 0%, #1A1A1A 100%)",
            border: "2px solid #555",
          }}
        >
          <div className="absolute inset-[3px] rounded-lg overflow-hidden">
            <div 
              className="absolute inset-0"
              style={{
                background: "conic-gradient(from 0deg, #E5393540 0deg 90deg, #1E88E540 90deg 180deg, #43A04740 180deg 270deg, #FDD83540 270deg 360deg)",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E53935]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FDD835]" />
                </div>
                <div className="flex items-center gap-1 -mt-0.5 ml-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1E88E5]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#43A047]" />
                </div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center mt-4">
              <span 
                className="text-white font-black text-[11px] tracking-widest"
                style={{ 
                  transform: "rotate(-10deg)",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.8)"
                }}
              >
                UNO
              </span>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute -bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
      >
        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white/90 text-[10px] sm:text-xs font-semibold">
          {count}
        </span>
        {canDraw && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-[9px] sm:text-[10px] text-[#FDD835] font-semibold tracking-wide"
          >
            TAP TO DRAW
          </motion.span>
        )}
      </motion.div>

      {canDraw && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{
            boxShadow: [
              "0 0 0 2px rgba(255,255,255,0.1)",
              "0 0 0 3px rgba(255,255,255,0.25)",
              "0 0 0 2px rgba(255,255,255,0.1)",
            ],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </motion.button>
  );
}
