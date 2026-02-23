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

const cardStyles: Record<CardColor, { bg: string; border: string; glow: string; text: string; gradient: string; dark: string }> = {
  red: {
    bg: "#E53935",
    border: "#FFCDD2",
    glow: "var(--neon-glow-red)",
    text: "#FFFFFF",
    gradient: "linear-gradient(145deg, #EF5350 0%, #C62828 100%)",
    dark: "#B71C1C",
  },
  blue: {
    bg: "#1E88E5",
    border: "#BBDEFB",
    glow: "var(--neon-glow-blue)",
    text: "#FFFFFF",
    gradient: "linear-gradient(145deg, #42A5F5 0%, #1565C0 100%)",
    dark: "#0D47A1",
  },
  green: {
    bg: "#43A047",
    border: "#C8E6C9",
    glow: "var(--neon-glow-green)",
    text: "#FFFFFF",
    gradient: "linear-gradient(145deg, #66BB6A 0%, #2E7D32 100%)",
    dark: "#1B5E20",
  },
  yellow: {
    bg: "#FDD835",
    border: "#FFF9C4",
    glow: "var(--neon-glow-yellow)",
    text: "#1A1A1A",
    gradient: "linear-gradient(145deg, #FFEE58 0%, #F9A825 100%)",
    dark: "#F57F17",
  },
  wild: {
    bg: "#2D2D2D",
    border: "#CE93D8",
    glow: "var(--neon-glow-wild)",
    text: "#FFFFFF",
    gradient: "linear-gradient(145deg, #424242 0%, #1A1A1A 100%)",
    dark: "#1A1A1A",
  },
};

const sizeStyles = {
  sm: {
    card: "w-[48px] h-[72px] min-w-[48px]",
    oval: "w-[32px] h-[48px]",
    number: "text-lg font-black",
    corner: "text-[9px] font-bold",
    cornerOffset: "top-0.5 left-1",
    cornerOffsetBottom: "bottom-0.5 right-1",
  },
  md: {
    card: "w-[60px] h-[90px] min-w-[60px] sm:w-[72px] sm:h-[108px] sm:min-w-[72px]",
    oval: "w-[42px] h-[60px] sm:w-[50px] sm:h-[72px]",
    number: "text-xl sm:text-2xl font-black",
    corner: "text-[10px] sm:text-[11px] font-bold",
    cornerOffset: "top-1 left-1.5",
    cornerOffsetBottom: "bottom-1 right-1.5",
  },
  lg: {
    card: "w-[80px] h-[120px] min-w-[80px] sm:w-[100px] sm:h-[150px] sm:min-w-[100px]",
    oval: "w-[56px] h-[80px] sm:w-[70px] sm:h-[100px]",
    number: "text-3xl sm:text-4xl font-black",
    corner: "text-xs sm:text-sm font-bold",
    cornerOffset: "top-1.5 left-2",
    cornerOffsetBottom: "bottom-1.5 right-2",
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

function SkipSymbol({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2.5" fill="none" />
      <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function ReverseSymbol({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      <path d="M6 8 L14 8 L14 5 L20 10 L14 15 L14 12 L6 12 Z" fill={color} transform="rotate(180 12 10)" />
      <path d="M18 16 L10 16 L10 13 L4 18 L10 23 L10 20 L18 20 Z" fill={color} opacity="0.6" transform="rotate(180 12 18) translate(0, -4)" />
    </svg>
  );
}

function CardBack({ size }: { size: "sm" | "md" | "lg" }) {
  const sizeConfig = sizeStyles[size];
  
  return (
    <div className={cn("relative rounded-xl overflow-hidden", sizeConfig.card)}>
      <div 
        className="absolute inset-0"
        style={{
          background: "linear-gradient(145deg, #1a1a2e 0%, #0f0f1a 100%)",
        }}
      />
      <div className="absolute inset-1 rounded-lg overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            background: "conic-gradient(from 0deg, #E5393540 0deg 90deg, #1E88E540 90deg 180deg, #43A04740 180deg 270deg, #FDD83540 270deg 360deg)",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-3/5 h-2/5 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(145deg, #2D2D2D 0%, #1A1A1A 100%)",
              border: "2px solid #FDD835",
              boxShadow: "0 0 20px rgba(253,216,53,0.3)",
            }}
          >
            <span 
              className="text-white font-black text-[10px] sm:text-xs tracking-wider italic"
              style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
            >
              UNO
            </span>
          </div>
        </div>
      </div>
    </div>
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
    return <CardBack size={size} />;
  }

  const displayValue = getDisplayValue(card.value);
  const isWildCard = ["wild", "wild4"].includes(card.value);

  return (
    <motion.div
      ref={cardRef}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        rotateX: tilt.x,
        rotateY: tilt.y,
      }}
      exit={{ scale: 0.5, opacity: 0 }}
      whileHover={
        !disabled && isPlayable
          ? {
              scale: 1.08,
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
        "relative rounded-xl overflow-hidden select-none",
        sizeConfig.card,
        !disabled && isPlayable && "cursor-pointer hover:z-50",
        disabled && "opacity-50 cursor-not-allowed grayscale-[30%]"
      )}
      style={{
        border: `2px solid ${styles.border}50`,
        background: isWildCard
          ? "linear-gradient(145deg, #424242 0%, #212121 100%)"
          : styles.gradient,
        boxShadow: isPlayable 
          ? `${styles.glow}, 0 8px 32px rgba(0,0,0,0.4)` 
          : "0 4px 20px rgba(0,0,0,0.4)",
        transformStyle: "preserve-3d",
        touchAction: "manipulation",
      }}
    >
      {isWildCard && (
        <div className="absolute inset-1 rounded-lg overflow-hidden">
          <div 
            className="absolute inset-0"
            style={{
              background: "conic-gradient(from 0deg, #E53935 0deg 90deg, #1E88E5 90deg 180deg, #43A047 180deg 270deg, #FDD835 270deg 360deg)",
            }}
          />
          <div className="absolute inset-1 rounded-md bg-[#1A1A1A]" />
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={cn(
            "rounded-full flex items-center justify-center shadow-inner",
            sizeConfig.oval
          )}
          style={{
            background: isWildCard
              ? "conic-gradient(from 0deg, #E53935 0deg 90deg, #1E88E5 90deg 180deg, #43A047 180deg 270deg, #FDD835 270deg 360deg)"
              : "rgba(255,255,255,0.92)",
            transform: "rotate(20deg)",
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          {card.value === "skip" ? (
            <div style={{ transform: "rotate(-20deg)" }}>
              <SkipSymbol 
                color={isWildCard ? "#FFFFFF" : styles.bg} 
                size={size === "sm" ? 16 : size === "md" ? 20 : 28} 
              />
            </div>
          ) : card.value === "reverse" ? (
            <div style={{ transform: "rotate(-20deg)" }}>
              <ReverseSymbol 
                color={isWildCard ? "#FFFFFF" : styles.bg} 
                size={size === "sm" ? 14 : size === "md" ? 18 : 24} 
              />
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
                transform: "rotate(-20deg)",
                textShadow: isWildCard 
                  ? "1px 1px 3px rgba(0,0,0,0.6)" 
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
        className={cn("absolute", sizeConfig.cornerOffset, sizeConfig.corner)}
        style={{ 
          color: isWildCard ? "#CE93D8" : styles.text,
          textShadow: "1px 1px 1px rgba(0,0,0,0.3)",
        }}
      >
        {displayValue.main}
      </div>
      
      <div 
        className={cn("absolute", sizeConfig.cornerOffsetBottom, sizeConfig.corner)}
        style={{ 
          color: isWildCard ? "#CE93D8" : styles.text,
          transform: "rotate(180deg)",
          textShadow: "1px 1px 1px rgba(0,0,0,0.3)",
        }}
      >
        {displayValue.main}
      </div>

      {isWildCard && (
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-0.5">
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
