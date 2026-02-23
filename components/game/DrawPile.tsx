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
      className={`relative transition-all ${canDraw ? "cursor-pointer" : "cursor-not-allowed opacity-70"}`}
      disabled={!canDraw}
      style={{ touchAction: "manipulation" }}
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
          className="absolute rounded-xl overflow-hidden"
          style={{ 
            zIndex: stackLayers - i,
            width: "64px",
            height: "96px",
          }}
        >
          <div 
            className="w-full h-full rounded-xl"
            style={{
              background: "linear-gradient(145deg, #2D2D2D 0%, #1A1A1A 100%)",
              border: "2px solid #444",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            }}
          >
            <div className="absolute inset-[3px] rounded-lg overflow-hidden">
              <div 
                className="absolute inset-0"
                style={{
                  background: "conic-gradient(from 0deg, #E5393525 0deg 90deg, #1E88E525 90deg 180deg, #43A04725 180deg 270deg, #FDD83525 270deg 360deg)",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="flex items-center gap-1 opacity-50">
                    <div className="w-2 h-2 rounded-full bg-[#E53935]" />
                    <div className="w-2 h-2 rounded-full bg-[#FDD835]" />
                  </div>
                  <div className="flex items-center gap-1 opacity-50 -mt-0.5 ml-1">
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
          width: "64px",
          height: "96px",
        }}
      >
        <div 
          className="w-full h-full rounded-xl"
          style={{
            background: "linear-gradient(145deg, #3D3D3D 0%, #1A1A1A 100%)",
            border: "2px solid #555",
            boxShadow: canDraw 
              ? "0 8px 32px rgba(0,0,0,0.5)"
              : "0 4px 20px rgba(0,0,0,0.4)",
          }}
        >
          <div className="absolute inset-[3px] rounded-lg overflow-hidden">
            <div 
              className="absolute inset-0"
              style={{
                background: "conic-gradient(from 0deg, #E5393535 0deg 90deg, #1E88E535 90deg 180deg, #43A04735 180deg 270deg, #FDD83535 270deg 360deg)",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#E53935]" />
                  <div className="w-3 h-3 rounded-full bg-[#FDD835]" />
                </div>
                <div className="flex items-center gap-1 -mt-0.5 ml-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#1E88E5]" />
                  <div className="w-3 h-3 rounded-full bg-[#43A047]" />
                </div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center mt-5">
              <span 
                className="text-white font-black text-xs tracking-widest italic"
                style={{ 
                  transform: "rotate(-10deg)",
                  textShadow: "1px 1px 3px rgba(0,0,0,0.8)"
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
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
      >
        <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white/90 text-xs font-bold shadow-lg">
          {count}
        </span>
        {canDraw && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-[10px] text-[#FDD835] font-bold tracking-wide"
          >
            DRAW
          </motion.span>
        )}
      </motion.div>

      {canDraw && (
        <>
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            animate={{
              boxShadow: [
                "0 0 0 2px rgba(255,255,255,0.1)",
                "0 0 0 4px rgba(255,255,255,0.25)",
                "0 0 0 2px rgba(255,255,255,0.1)",
              ],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              background: "radial-gradient(circle at center, rgba(253,216,53,0.3), transparent 70%)",
            }}
          />
        </>
      )}
    </motion.button>
  );
}
