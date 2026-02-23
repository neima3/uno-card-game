"use client";

import { motion } from "framer-motion";
import { Card, CardColor, CardValue } from "@/lib/game-engine";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";

interface UnoCardProps {
  card: Card;
  onClick?: () => void;
  disabled?: boolean;
  isPlayable?: boolean;
  index?: number;
  showFace?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

const cardColors: Record<CardColor, string> = {
  red: "#D32F2F",
  blue: "#1565C0",
  green: "#2E7D32",
  yellow: "#F9A825",
  wild: "#000000",
};

// SVG Symbols for Action Cards
const Symbols = {
  Skip: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM4 12C4 7.58 7.58 4 12 4C13.85 4 15.55 4.63 16.9 5.69L5.69 16.9C4.63 15.55 4 13.85 4 12ZM12 20C10.15 20 8.45 19.37 7.1 18.31L18.31 7.1C19.37 8.45 20 10.15 20 12C20 16.42 16.42 20 12 20Z" />
    </svg>
  ),
  Reverse: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21 9H7.17l2.59-2.59L8.34 5l-5 5l5 5l1.41-1.41L7.17 11H19c.55 0 1 .45 1 1s-.45 1-1 1H6v2h13c1.66 0 3-1.34 3-3s-1.34-3-3-3z" />
      <path d="M5 15h13.83l-2.59 2.59L17.66 19l5-5l-5-5l-1.41 1.41L18.83 13H7c-.55 0-1-.45-1-1s.45-1 1-1h13v-2H7c-1.66 0-3 1.34-3 3s1.34 3 3 3z" />
    </svg>
  ),
};

export function UnoCard({
  card,
  onClick,
  disabled = false,
  isPlayable = false,
  index = 0,
  showFace = true,
  size = "md",
}: UnoCardProps) {
  const isWild = card.color === "wild";
  const [isHovered, setIsHovered] = useState(false);

  // Size dimensions
  const dimensions = {
    sm: { w: "w-10", h: "h-14", text: "text-xs", oval: "w-8 h-12" },
    md: { w: "w-16", h: "h-24", text: "text-base", oval: "w-12 h-20" },
    lg: { w: "w-24", h: "h-36", text: "text-2xl", oval: "w-20 h-28" },
    xl: { w: "w-32", h: "h-48", text: "text-4xl", oval: "w-24 h-36" },
  }[size];

  // Helper to get small corner value
  const getCornerValue = () => {
    if (card.value === "skip") return "⊘";
    if (card.value === "reverse") return "⇄";
    if (card.value === "draw2") return "+2";
    if (card.value === "wild") return ""; // Wild corner has special 4-color symbol
    if (card.value === "wild4") return "+4";
    return card.value;
  };

  // Helper to render center content
  const renderCenterContent = () => {
    if (card.value === "skip") return <Symbols.Skip className="w-full h-full p-1" />;
    if (card.value === "reverse") return <Symbols.Reverse className="w-full h-full p-1" />;
    if (card.value === "draw2") return <span className="font-black tracking-tighter" style={{ fontSize: '120%' }}>+2</span>;
    if (card.value === "wild") return (
       <div className="relative w-full h-full flex items-center justify-center">
         <div className="w-[90%] h-[90%] rounded-full bg-black flex items-center justify-center">
             <span className="text-white font-black text-[30%] tracking-widest italic" style={{ fontFamily: 'var(--font-sans)' }}>WILD</span>
         </div>
       </div>
    );
    if (card.value === "wild4") return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-[90%] h-[90%] rounded-full bg-black flex items-center justify-center gap-0.5 flex-wrap px-1">
             <span className="text-white font-black text-[40%] tracking-tighter">+4</span>
             <div className="absolute inset-0 flex flex-wrap opacity-30">
                <div className="w-1/2 h-1/2 bg-[#D32F2F]"></div>
                <div className="w-1/2 h-1/2 bg-[#1565C0]"></div>
                <div className="w-1/2 h-1/2 bg-[#2E7D32]"></div>
                <div className="w-1/2 h-1/2 bg-[#F9A825]"></div>
             </div>
        </div>
      </div>
    );
    
    return <span className="font-black text-[120%]" style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.2)" }}>{card.value}</span>;
  };

  if (!showFace) {
    // Authentic Card Back
    return (
      <div 
        className={cn(
          "relative rounded-lg overflow-hidden shadow-xl transition-transform border-[3px] border-white select-none", 
          dimensions.w, dimensions.h
        )}
        style={{ 
          backgroundColor: "#111",
          transform: isHovered ? "scale(1.05)" : "scale(1)",
        }}
      >
        {/* Black background */}
        <div className="absolute inset-0 bg-[#1a1a1a]" />
        
        {/* Rainbow Oval Border */}
        <div className="absolute inset-[6%] rounded-[50%] opacity-90"
             style={{
               background: "conic-gradient(#D32F2F, #F9A825, #2E7D32, #1565C0, #D32F2F)",
               padding: "6%" // Thickness of rainbow ring
             }}>
             <div className="w-full h-full bg-[#1a1a1a] rounded-[50%] flex items-center justify-center">
                <span className="text-white font-black italic tracking-tighter" 
                      style={{ 
                        fontSize: size === 'sm' ? '10px' : size === 'md' ? '18px' : '32px',
                        textShadow: "1px 1px 0 #F9A825"
                      }}>
                  UNO
                </span>
             </div>
        </div>
        
        {/* Subtle texture */}
        <div className="absolute inset-0 opacity-20 bg-[url('/noise.svg')]" />
      </div>
    );
  }

  // Card Face
  const baseColor = cardColors[card.color];
  const textColor = isWild ? "white" : baseColor;

  return (
    <motion.div
      whileHover={isPlayable && !disabled ? { y: -12, scale: 1.05, zIndex: 50 } : {}}
      whileTap={isPlayable && !disabled ? { scale: 0.95 } : {}}
      onClick={!disabled ? onClick : undefined}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "relative rounded-lg overflow-hidden select-none transition-all duration-200",
        dimensions.w, dimensions.h,
        disabled && "grayscale-[40%] opacity-60",
        isPlayable && !disabled && "cursor-pointer ring-2 ring-white ring-offset-2 ring-offset-transparent shadow-[0_0_15px_rgba(255,255,255,0.3)]"
      )}
      style={{
        backgroundColor: baseColor,
        boxShadow: "0 4px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)"
      }}
    >
      {/* Playable Indicator Label */}
      {isPlayable && isHovered && !disabled && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg z-50">
          ✓ PLAY
        </div>
      )}

      {/* Wild Card Background Quadrants */}
      {isWild && (
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          <div className="bg-[#D32F2F]" />
          <div className="bg-[#1565C0]" />
          <div className="bg-[#2E7D32]" />
          <div className="bg-[#F9A825]" />
        </div>
      )}

      {/* Top Left Corner */}
      <div className="absolute top-1 left-1.5 flex flex-col items-center">
        <span className={cn("font-bold text-white drop-shadow-md leading-none", dimensions.text)}>
          {getCornerValue()}
        </span>
      </div>

      {/* Center Oval */}
      <div 
        className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-[50%] flex items-center justify-center shadow-inner",
            dimensions.oval
        )}
        style={{ transform: "translate(-50%, -50%) rotate(-25deg)" }}
      >
        <div 
          className={cn("font-black flex items-center justify-center w-full h-full", dimensions.text)}
          style={{ 
            color: isWild ? "black" : baseColor, 
            fontSize: "250%" // Make center content huge
          }}
        >
          {renderCenterContent()}
        </div>
      </div>

      {/* Bottom Right Corner (Inverted) */}
      <div className="absolute bottom-1 right-1.5 flex flex-col items-center rotate-180">
        <span className={cn("font-bold text-white drop-shadow-md leading-none", dimensions.text)}>
          {getCornerValue()}
        </span>
      </div>

      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
    </motion.div>
  );
}
