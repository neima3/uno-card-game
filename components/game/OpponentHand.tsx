"use client";

import { motion } from "framer-motion";

interface OpponentHandProps {
  cardCount: number;
  displayName: string;
  isCurrentTurn: boolean;
  hasSaidUno?: boolean;
  seatIndex?: number;
}

const seatColors = [
  { bg: "#E53935", text: "#FFCDD2" },
  { bg: "#1E88E5", text: "#BBDEFB" },
  { bg: "#43A047", text: "#C8E6C9" },
  { bg: "#FDD835", text: "#1A1A1A" },
  { bg: "#8E24AA", text: "#E1BEE7" },
  { bg: "#FF7043", text: "#FFCCBC" },
];

export function OpponentHand({
  cardCount,
  displayName,
  isCurrentTurn,
  hasSaidUno = false,
  seatIndex = 0,
}: OpponentHandProps) {
  const seatColor = seatColors[seatIndex % seatColors.length];
  const maxVisible = 4;
  const visibleCards = Math.min(cardCount, maxVisible);
  const overlap = 14;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`relative flex flex-col items-center gap-2 p-2 ${isCurrentTurn ? "player-slot active" : "player-slot"}`}
    >
      <div className="relative flex items-center gap-2">
        <motion.div
          animate={isCurrentTurn ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="relative"
        >
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg"
            style={{
              background: `linear-gradient(145deg, ${seatColor.bg}, ${seatColor.bg}CC)`,
              boxShadow: isCurrentTurn 
                ? `0 0 20px ${seatColor.bg}60, 0 4px 12px rgba(0,0,0,0.3)`
                : "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            {initial}
          </div>
          {isCurrentTurn && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: `2px solid ${seatColor.bg}` }}
              animate={{ scale: [1, 1.3], opacity: [0.8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </motion.div>

        <div className="flex flex-col gap-1">
          <span 
            className={`text-xs sm:text-sm font-semibold truncate max-w-[80px] ${
              isCurrentTurn ? "text-white" : "text-white/70"
            }`}
          >
            {displayName}
          </span>
          
          <div className="flex items-center gap-1.5">
            <div className="flex items-center">
              {Array.from({ length: visibleCards }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="relative"
                  style={{ 
                    marginLeft: i === 0 ? 0 : -overlap,
                    zIndex: i,
                  }}
                >
                  <div 
                    className="w-7 h-9 sm:w-8 sm:h-11 rounded-md overflow-hidden card-shadow"
                    style={{
                      background: "linear-gradient(145deg, #2D2D2D 0%, #1A1A1A 100%)",
                      border: "1px solid #444",
                    }}
                  >
                    <div className="absolute inset-0.5 rounded overflow-hidden">
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: "conic-gradient(from 0deg, #E5393540 0deg 90deg, #1E88E540 90deg 180deg, #43A04740 180deg 270deg, #FDD83540 270deg 360deg)",
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="min-w-[20px] h-5 px-1.5 rounded-full bg-white text-gray-900 text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-md"
            >
              {cardCount}
            </motion.div>
          </div>
        </div>
      </div>

      {cardCount === 1 && hasSaidUno && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
          className="absolute -bottom-1 px-2 py-0.5 rounded-full bg-[#E53935] text-white text-[10px] font-bold tracking-wider shadow-lg"
          style={{ boxShadow: "0 0 15px rgba(229,57,53,0.6)" }}
        >
          UNO!
        </motion.div>
      )}

      {cardCount === 1 && !hasSaidUno && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF5722] text-white text-xs font-bold flex items-center justify-center shadow-lg"
        >
          !
        </motion.div>
      )}
    </motion.div>
  );
}
