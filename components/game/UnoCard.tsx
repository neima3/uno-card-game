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

const cardStyles: Record<CardColor, { bg: string; border: string; glow: string; text: string }> = {
  red: {
    bg: "linear-gradient(135deg, #FF2B2B 0%, #CC0000 100%)",
    border: "#FF6B6B",
    glow: "var(--neon-glow-red)",
    text: "#FFFFFF",
  },
  blue: {
    bg: "linear-gradient(135deg, #1A8CFF 0%, #0066CC 100%)",
    border: "#66B3FF",
    glow: "var(--neon-glow-blue)",
    text: "#FFFFFF",
  },
  green: {
    bg: "linear-gradient(135deg, #00CC66 0%, #009944 100%)",
    border: "#33FF88",
    glow: "var(--neon-glow-green)",
    text: "#FFFFFF",
  },
  yellow: {
    bg: "linear-gradient(135deg, #FFD700 0%, #CC9900 100%)",
    border: "#FFEC80",
    glow: "var(--neon-glow-yellow)",
    text: "#1A1A1A",
  },
  wild: {
    bg: "linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%)",
    border: "#9B59B6",
    glow: "var(--neon-glow-wild)",
    text: "#FFFFFF",
  },
};

const sizeStyles = {
  sm: {
    card: "w-10 h-14 sm:w-12 sm:h-16",
    oval: "w-8 h-10",
    number: "text-base sm:text-lg",
    corner: "text-[8px] sm:text-[10px]",
  },
  md: {
    card: "w-16 h-24 sm:w-20 sm:h-28",
    oval: "w-12 h-16 sm:w-14 sm:h-20",
    number: "text-2xl sm:text-3xl",
    corner: "text-xs sm:text-sm",
  },
  lg: {
    card: "w-24 h-36 sm:w-32 sm:h-44",
    oval: "w-20 h-28 sm:w-24 sm:h-32",
    number: "text-4xl sm:text-5xl",
    corner: "text-base sm:text-lg",
  },
};

function getDisplayValue(value: CardValue): string {
  switch (value) {
    case "skip":
      return "⊘";
    case "reverse":
      return "⟳";
    case "draw2":
      return "+2";
    case "wild":
      return "🌈";
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
      x: y * -10,
      y: x * 10,
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
        style={{
          background: "linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%)",
          border: `2px solid #444`,
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
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/30 via-yellow-500/30 to-green-500/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span 
              className="text-white font-black text-xs sm:text-sm"
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
    );
  }

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
              scale: 1.08,
              y: -8,
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
        "relative rounded-xl overflow-hidden cursor-pointer transition-shadow duration-200",
        sizeConfig.card,
        !disabled && isPlayable && "hover:z-50",
        disabled && "opacity-60 cursor-not-allowed"
      )}
      style={{
        border: `3px solid ${styles.border}`,
        background: isWild 
          ? "conic-gradient(from 0deg, #FF2B2B, #1A8CFF, #00CC66, #FFD700, #FF2B2B)"
          : styles.bg,
        boxShadow: isPlayable ? styles.glow : undefined,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      {isWild && (
        <div
          className="absolute inset-1 rounded-lg"
          style={{
            background: "rgba(0,0,0,0.85)",
          }}
        />
      )}
      
      <div 
        className={cn(
          "absolute inset-0 flex items-center justify-center",
          isWild && "inset-2"
        )}
      >
        <div
          className={cn(
            "rounded-full flex items-center justify-center shadow-inner",
            sizeConfig.oval
          )}
          style={{
            background: isWild 
              ? "conic-gradient(from 45deg, #FF2B2B, #1A8CFF, #00CC66, #FFD700, #FF2B2B)"
              : "rgba(255,255,255,0.95)",
            transform: "rotate(20deg)",
          }}
        >
          <span
            className="font-black"
            style={{
              color: isWild ? "#FFFFFF" : (card.color === "yellow" ? "#B8860B" : styles.bg.includes("red") ? "#CC0000" : styles.bg.includes("blue") ? "#0066CC" : styles.bg.includes("green") ? "#009944" : "#000"),
              transform: "rotate(-20deg)",
              textShadow: isWild ? "2px 2px 4px rgba(0,0,0,0.5)" : "1px 1px 2px rgba(0,0,0,0.2)",
            }}
          >
            <span className={sizeConfig.number}>
              {getDisplayValue(card.value)}
            </span>
          </span>
        </div>
      </div>

      <div 
        className={cn("absolute top-1 left-1.5 font-bold", sizeConfig.corner)}
        style={{ 
          color: styles.text,
          transform: "rotate(-15deg)",
          textShadow: "1px 1px 2px rgba(0,0,0,0.3)"
        }}
      >
        {getDisplayValue(card.value)}
      </div>
      
      <div 
        className={cn("absolute bottom-1 right-1.5 font-bold", sizeConfig.corner)}
        style={{ 
          color: styles.text,
          transform: "rotate(165deg)",
          textShadow: "1px 1px 2px rgba(0,0,0,0.3)"
        }}
      >
        {getDisplayValue(card.value)}
      </div>

      {isWild && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
        </div>
      )}

      {isPlayable && !disabled && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{
            boxShadow: [
              `inset 0 0 0 2px ${styles.border}40`,
              `inset 0 0 0 3px ${styles.border}80`,
              `inset 0 0 0 2px ${styles.border}40`,
            ],
          }}
          transition={{
            duration: 1.5,
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
