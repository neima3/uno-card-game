"use client";

import { motion } from "framer-motion";
import { Card, CardColor, CardValue } from "@/lib/game-engine";
import { cn } from "@/lib/utils";

interface UnoCardProps {
  card: Card;
  onClick?: () => void;
  disabled?: boolean;
  isPlayable?: boolean;
  index?: number;
  showFace?: boolean;
  small?: boolean;
}

const colorStyles: Record<CardColor, string> = {
  red: "bg-gradient-to-br from-red-500 to-red-700",
  blue: "bg-gradient-to-br from-blue-500 to-blue-700",
  green: "bg-gradient-to-br from-green-500 to-green-700",
  yellow: "bg-gradient-to-br from-yellow-400 to-yellow-600",
  wild: "bg-gradient-to-br from-gray-800 to-gray-900",
};

const borderColorStyles: Record<CardColor, string> = {
  red: "border-red-400",
  blue: "border-blue-400",
  green: "border-green-400",
  yellow: "border-yellow-300",
  wild: "border-gray-600",
};

function getDisplayValue(value: CardValue): string {
  switch (value) {
    case "skip":
      return "⊘";
    case "reverse":
      return "⟲";
    case "draw2":
      return "+2";
    case "wild":
      return "W";
    case "wild4":
      return "+4";
    default:
      return value;
  }
}

function getCardLabel(value: CardValue): string {
  switch (value) {
    case "skip":
      return "Skip";
    case "reverse":
      return "Reverse";
    case "draw2":
      return "Draw Two";
    case "wild":
      return "Wild";
    case "wild4":
      return "Wild Draw Four";
    default:
      return value;
  }
}

export function UnoCard({
  card,
  onClick,
  disabled = false,
  isPlayable = false,
  index = 0,
  showFace = true,
  small = false,
}: UnoCardProps) {
  const isWild = card.color === "wild";
  
  const wildGradient = isWild
    ? "bg-[conic-gradient(from_0deg,red,blue,green,yellow,red)]"
    : "";

  if (!showFace) {
    return (
      <div
        className={cn(
          "relative rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 shadow-xl border-2 border-gray-600",
          small ? "w-12 h-16 sm:w-14 sm:h-20" : "w-16 h-24 sm:w-20 sm:h-28"
        )}
      >
        <div className="absolute inset-2 rounded-lg bg-gradient-to-br from-red-600 via-yellow-500 to-green-600 opacity-80" />
        <div className="absolute inset-3 rounded-md bg-gray-900 flex items-center justify-center">
          <span className="text-white font-black text-xs sm:text-sm rotate-[-20deg]">UNO</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0, rotateY: 180 }}
      animate={{ scale: 1, rotateY: 0 }}
      exit={{ scale: 0, rotateY: -180 }}
      whileHover={
        !disabled && isPlayable
          ? {
              scale: 1.1,
              y: -20,
              rotateZ: [-2, 2, -2],
              transition: { duration: 0.2 },
            }
          : {}
      }
      whileTap={!disabled && isPlayable ? { scale: 0.95 } : {}}
      onClick={!disabled && isPlayable ? onClick : undefined}
      className={cn(
        "relative rounded-xl shadow-xl border-2 overflow-hidden transition-all duration-200",
        small ? "w-12 h-16 sm:w-14 sm:h-20" : "w-16 h-24 sm:w-20 sm:h-28",
        borderColorStyles[card.color],
        !disabled && isPlayable
          ? "cursor-pointer hover:shadow-2xl hover:shadow-white/20"
          : disabled || !isPlayable
          ? "opacity-60 cursor-not-allowed"
          : ""
      )}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      {isWild ? (
        <div className={cn("absolute inset-0", wildGradient)}>
          <div className="absolute inset-1 rounded-lg bg-gray-900/90 flex flex-col items-center justify-center">
            <span className="text-white font-black text-lg sm:text-2xl">
              {getDisplayValue(card.value)}
            </span>
            {card.value === "wild" && (
              <div className="flex gap-0.5 mt-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={cn("absolute inset-0", colorStyles[card.color])}>
          <div className="absolute inset-1 rounded-lg bg-white/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3/4 h-3/4 rounded-full bg-white/95 rotate-[20deg] flex items-center justify-center shadow-inner">
              <span
                className={cn(
                  "font-black",
                  small ? "text-xl sm:text-2xl" : "text-2xl sm:text-4xl",
                  card.color === "yellow" ? "text-yellow-600" : `text-${card.color}-600`
                )}
              >
                {getDisplayValue(card.value)}
              </span>
            </div>
          </div>
          <div className="absolute top-1 left-2 text-white font-bold text-xs sm:text-sm rotate-[-20deg]">
            {getDisplayValue(card.value)}
          </div>
          <div className="absolute bottom-1 right-2 text-white font-bold text-xs sm:text-sm rotate-[160deg]">
            {getDisplayValue(card.value)}
          </div>
        </div>
      )}
      <div className="sr-only">{getCardLabel(card.value)} {card.color !== "wild" ? card.color : ""}</div>
    </motion.div>
  );
}
