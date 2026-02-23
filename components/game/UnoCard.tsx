"use client";

import { useState, useRef } from "react";
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
  size?: "sm" | "md" | "lg";
}

const cardStyles: Record<CardColor, { bg: string; border: string; glow: string; text: string; gradient: string }> = {
  red: {
    bg: "#E53935",
    border: "#FFCDD2",
    glow: "var(--neon-glow-red)",
    text: "#FFFFFF",
    gradient: "linear-gradient(145deg, #EF5350 0%, #C62828 100%)",
  },
  blue: {
    bg: "#1E88E5",
    border: "#BBDEFB",
    glow: "var(--neon-glow-blue)",
    text: "#FFFFFF",
    gradient: "linear-gradient(145deg, #42A5F5 0%, #1565C0 100%)",
  },
  green: {
    bg: "#43A047",
    border: "#C8E6C9",
    glow: "var(--neon-glow-green)",
    text: "#FFFFFF",
    gradient: "linear-gradient(145deg, #66BB6A 0%, #2E7D32 100%)",
  },
  yellow: {
    bg: "#FDD835",
    border: "#FFF9C4",
    glow: "var(--neon-glow-yellow)",
    text: "#1A1A1A",
    gradient: "linear-gradient(145deg, #FFEE58 0%, #F9A825 100%)",
  },
  wild: {
    bg: "#2D2D2D",
    border: "#CE93D8",
    glow: "var(--neon-glow-wild)",
    text: "#FFFFFF",
    gradient: "linear-gradient(145deg, #424242 0%, #1A1A1A 100%)",
  },
};

const sizeStyles = {
  sm: {
    card: "w-[50px] h-[70px] min-w-[50px]",
    oval: "w-[36px] h-[44px]",
    number: "text-lg font-black",
    corner: "text-[10px] font-bold",
    symbol: "text-base",
  },
  md: {
    card: "w-[60px] h-[85px] min-w-[60px] sm:w-[72px] sm:h-[100px] sm:min-w-[72px]",
    oval: "w-[44px] h-[56px] sm:w-[52px] sm:h-[64px]",
    number: "text-xl sm:text-2xl font-black",
    corner: "text-[11px] sm:text-xs font-bold",
    symbol: "text-lg sm:text-xl",
  },
  lg: {
    card: "w-[80px] h-[112px] min-w-[80px] sm:w-[100px] sm:h-[140px] sm:min-w-[100px]",
    oval: "w-[60px] h-[76px] sm:w-[76px] sm:h-[96px]",
    number: "text-3xl sm:text-4xl font-black",
    corner: "text-sm sm:text-base font-bold",
    symbol: "text-2xl sm:text-3xl",
  },
};

function getDisplayValue(value: CardValue): { main: string; small?: string } {
  switch (value) {
    case "skip":
      return { main: "⊘", small: "SKIP" };
    case "reverse":
      return { main: "⇄", small: "REV" };
    case "draw2":
      return { main: "+2" };
    case "wild":
      return { main: "W", small: "WILD" };
    case "wild4":
      return { main: "+4" };
    default:
      return { main: value };
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

function SkipSymbol({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.5" />
      <line x1="5" y1="5" x2="19" y2="19" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function ReverseSymbol({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
      <path d="M4 12 L10 6 L10 10 L20 10 L20 14 L10 14 L10 18 Z" fill={color} transform="rotate(180 12 12)" />
      <path d="M4 12 L10 6 L10 10 L20 10 L20 14 L10 14 L10 18 Z" fill={color} opacity="0.5" />
    </svg>
  );
}

export function UnoCard({
  card,
  onClick,
  disabled = false,
  isPlayable = false,
  index = 0,
  showFace = true,
  size = "md",
}: UnoCardProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const isWild = card.color === "wild";
  const styles = cardStyles[card.color];
  const sizeConfig = sizeStyles[size];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || disabled) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    setTilt({
      x: y * -8,
      y: x * 8,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  if (!showFace) {
    return (
      <div
        className={cn(
          "relative rounded-xl overflow-hidden card-shadow",
          sizeConfig.card
        )}
      >
        <div className="absolute inset-0 uno-card-back" />
        <div className="absolute inset-[3px] rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="flex items-center gap-0.5">
                <div className="w-3 h-3 rounded-full bg-[#E53935]" />
                <div className="w-3 h-3 rounded-full bg-[#FDD835]" />
              </div>
              <div className="flex items-center gap-0.5 -mt-1 ml-1.5">
                <div className="w-3 h-3 rounded-full bg-[#1E88E5]" />
                <div className="w-3 h-3 rounded-full bg-[#43A047]" />
              </div>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center mt-6">
            <span 
              className="text-white font-black text-xs tracking-wider"
              style={{ 
                transform: "rotate(-12deg)",
                textShadow: "1px 1px 2px rgba(0,0,0,0.8)"
              }}
            >
              UNO
            </span>
          </div>
        </div>
      </div>
    );
  }

  const displayValue = getDisplayValue(card.value);
  const isActionCard = ["skip", "reverse", "draw2"].includes(card.value);
  const isWildCard = ["wild", "wild4"].includes(card.value);

  return (
    <motion.div
      ref={cardRef}
      initial={{ scale: 0, rotateY: 180 }}
      animate={{ 
        scale: 1, 
        rotateX: tilt.x,
        rotateY: tilt.y,
      }}
      exit={{ scale: 0, rotateY: -180 }}
      whileHover={
        !disabled && isPlayable
          ? {
              scale: 1.1,
              y: -12,
              z: 50,
            }
          : {}
      }
      whileTap={!disabled && isPlayable ? { scale: 0.95 } : {}}
      onClick={!disabled && isPlayable ? onClick : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
      className={cn(
        "relative rounded-xl overflow-hidden transition-all duration-200 select-none",
        sizeConfig.card,
        !disabled && isPlayable && "cursor-pointer hover:z-50",
        disabled && "opacity-50 cursor-not-allowed grayscale-[30%]"
      )}
      style={{
        border: `2px solid ${styles.border}40`,
        background: isWildCard
          ? "linear-gradient(145deg, #424242 0%, #212121 100%)"
          : styles.gradient,
        boxShadow: isPlayable ? styles.glow : "0 4px 20px rgba(0,0,0,0.4)",
        transformStyle: "preserve-3d",
      }}
    >
      {isWildCard && (
        <div className="absolute inset-[3px] rounded-lg overflow-hidden">
          <div 
            className="absolute inset-0"
            style={{
              background: "conic-gradient(from 0deg, #E53935 0deg 90deg, #1E88E5 90deg 180deg, #43A047 180deg 270deg, #FDD835 270deg 360deg)",
            }}
          />
          <div className="absolute inset-[2px] rounded-md bg-[#2D2D2D]" />
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={cn(
            "rounded-full flex items-center justify-center",
            sizeConfig.oval
          )}
          style={{
            background: isWildCard
              ? "conic-gradient(from 0deg, #E53935 0deg 90deg, #1E88E5 90deg 180deg, #43A047 180deg 270deg, #FDD835 270deg 360deg)"
              : "rgba(255,255,255,0.92)",
            transform: "rotate(25deg)",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          {card.value === "skip" ? (
            <div className="w-[60%] h-[60%]" style={{ transform: "rotate(-25deg)" }}>
              <SkipSymbol color={isWildCard ? "#FFFFFF" : styles.bg} />
            </div>
          ) : card.value === "reverse" ? (
            <div className="w-[55%] h-[55%]" style={{ transform: "rotate(-25deg)" }}>
              <ReverseSymbol color={isWildCard ? "#FFFFFF" : styles.bg} />
            </div>
          ) : (
            <span
              className="font-black italic"
              style={{
                color: isWildCard 
                  ? "#FFFFFF" 
                  : card.color === "yellow" 
                    ? "#F57F17" 
                    : styles.bg,
                transform: "rotate(-25deg)",
                textShadow: isWildCard 
                  ? "1px 1px 2px rgba(0,0,0,0.5)" 
                  : "none",
              }}
            >
              <span className={sizeConfig.number}>
                {displayValue.main}
              </span>
            </span>
          )}
        </div>
      </div>

      <div 
        className={cn("absolute top-1 left-1.5", sizeConfig.corner)}
        style={{ 
          color: isWildCard ? "#CE93D8" : styles.text,
        }}
      >
        {displayValue.main}
      </div>
      
      <div 
        className={cn("absolute bottom-1 right-1.5", sizeConfig.corner)}
        style={{ 
          color: isWildCard ? "#CE93D8" : styles.text,
          transform: "rotate(180deg)",
        }}
      >
        {displayValue.main}
      </div>

      {isWildCard && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#E53935]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#1E88E5]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#43A047]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#FDD835]" />
        </div>
      )}

      {isPlayable && !disabled && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{
            boxShadow: [
              `inset 0 0 0 2px ${styles.border}30`,
              `inset 0 0 0 3px ${styles.border}60`,
              `inset 0 0 0 2px ${styles.border}30`,
            ],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      <div className="sr-only">
        {getCardLabel(card.value)} {card.color !== "wild" ? card.color : ""}
      </div>
    </motion.div>
  );
}
