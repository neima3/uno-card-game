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
  variant?: "default" | "compact";
}

const cardColors: Record<CardColor, string> = {
  red: "#D32F2F",
  blue: "#1565C0",
  green: "#2E7D32",
  yellow: "#F9A825",
  wild: "#1a1a1a",
};

const cardGlows: Record<CardColor, string> = {
  red: "0 0 30px rgba(211, 47, 47, 0.6), 0 0 60px rgba(211, 47, 47, 0.3)",
  blue: "0 0 30px rgba(21, 101, 192, 0.6), 0 0 60px rgba(21, 101, 192, 0.3)",
  green: "0 0 30px rgba(46, 125, 50, 0.6), 0 0 60px rgba(46, 125, 50, 0.3)",
  yellow: "0 0 30px rgba(249, 168, 37, 0.6), 0 0 60px rgba(249, 168, 37, 0.3)",
  wild: "0 0 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 255, 255, 0.1)",
};

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
  variant = "default",
}: UnoCardProps) {
  const isWild = card.color === "wild";
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const dimensions = {
    sm: { w: "w-10", h: "h-14", text: "text-xs", oval: "w-8 h-12" },
    md: { w: "w-16", h: "h-24", text: "text-base", oval: "w-12 h-20" },
    lg: { w: "w-20 lg:w-24", h: "h-28 lg:h-36", text: "text-2xl", oval: "w-16 lg:w-20 h-24 lg:h-28" },
    xl: { w: "w-28 lg:w-32", h: "h-40 lg:h-48", text: "text-4xl", oval: "w-24 lg:w-28 h-32 lg:h-36" },
  }[size];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !isPlayable || disabled) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const tiltX = (y - 0.5) * 15;
    const tiltY = (x - 0.5) * -15;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const getCornerValue = () => {
    if (card.value === "skip") return "⊘";
    if (card.value === "reverse") return "⇄";
    if (card.value === "draw2") return "+2";
    if (card.value === "wild") return "";
    if (card.value === "wild4") return "+4";
    return card.value;
  };

  const renderCenterContent = () => {
    if (card.value === "skip") return <Symbols.Skip className="w-full h-full p-1" />;
    if (card.value === "reverse") return <Symbols.Reverse className="w-full h-full p-1" />;
    if (card.value === "draw2") return <span className="font-black tracking-tighter" style={{ fontSize: '140%' }}>+2</span>;
    if (card.value === "wild") return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-[85%] h-[85%] rounded-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center border-2 border-white/10">
          <span className="text-white font-black text-[28%] tracking-widest italic drop-shadow-lg">WILD</span>
        </div>
      </div>
    );
    if (card.value === "wild4") return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-[85%] h-[85%] rounded-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center border-2 border-white/10 relative overflow-hidden">
          <span className="text-white font-black text-[35%] tracking-tighter relative z-10">+4</span>
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-40">
            <div className="bg-[#D32F2F]" />
            <div className="bg-[#1565C0]" />
            <div className="bg-[#2E7D32]" />
            <div className="bg-[#F9A825]" />
          </div>
        </div>
      </div>
    );
    return <span className="font-black text-[130%]" style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.3)" }}>{card.value}</span>;
  };

  if (!showFace) {
    return (
      <div 
        ref={cardRef}
        className={cn(
          "relative rounded-xl overflow-hidden select-none transition-all duration-300",
          dimensions.w, dimensions.h
        )}
        style={{
          boxShadow: isHovered ? "0 10px 40px rgba(0,0,0,0.4), 0 0 30px rgba(255,255,255,0.1)" : "0 4px 20px rgba(0,0,0,0.3)",
          transform: isHovered ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.05)` : "perspective(1000px) rotateX(0deg) rotateY(0deg)",
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-[#1a1a1a] to-gray-900" />
        
        <div className="absolute inset-[8%] rounded-[50%] overflow-hidden"
             style={{
               background: "conic-gradient(from 0deg, #D32F2F, #F9A825, #2E7D32, #1565C0, #D32F2F)",
             }}>
          <div className="absolute inset-[15%] bg-gradient-to-br from-gray-900 via-[#1a1a1a] to-gray-900 rounded-[50%] flex items-center justify-center">
            <span className="text-white font-black italic tracking-tighter drop-shadow-lg" 
                  style={{ 
                    fontSize: size === 'sm' ? '10px' : size === 'md' ? '16px' : size === 'lg' ? '22px' : '28px',
                    textShadow: "2px 2px 0 #F9A825, -1px -1px 0 #D32F2F"
                  }}>
              UNO
            </span>
          </div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none" />
        
        <div className="absolute inset-0 border border-white/10 rounded-xl pointer-events-none" />
      </div>
    );
  }

  const baseColor = cardColors[card.color];
  const glowStyle = cardGlows[card.color];

  return (
    <motion.div
      ref={cardRef}
      whileHover={isPlayable && !disabled ? { y: -16, zIndex: 50 } : {}}
      whileTap={isPlayable && !disabled ? { scale: 0.95 } : {}}
      onClick={!disabled ? onClick : undefined}
      onMouseMove={handleMouseMove}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={handleMouseLeave}
      className={cn(
        "relative rounded-xl overflow-hidden select-none cursor-default",
        dimensions.w, dimensions.h,
        disabled && "grayscale-[50%] opacity-50",
        isPlayable && !disabled && "cursor-pointer"
      )}
      style={{
        backgroundColor: baseColor,
        boxShadow: isPlayable && isHovered && !disabled 
          ? `${glowStyle}, 0 8px 32px rgba(0,0,0,0.4)` 
          : "0 4px 20px rgba(0,0,0,0.3)",
        transform: isHovered && isPlayable && !disabled 
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.05)` 
          : "perspective(1000px) rotateX(0deg) rotateY(0deg)",
        transition: "transform 0.15s ease-out, box-shadow 0.3s ease",
      }}
    >
      {isPlayable && isHovered && !disabled && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-black text-[11px] font-bold px-3 py-1 rounded-full shadow-lg z-50"
        >
          PLAY
        </motion.div>
      )}

      {isPlayable && !disabled && (
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none z-10"
          style={{
            boxShadow: `inset 0 0 0 2px rgba(255,255,255,0.4), inset 0 0 20px rgba(255,255,255,0.1)`,
          }}
        />
      )}

      {isWild && (
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          <div className="bg-[#D32F2F]" />
          <div className="bg-[#1565C0]" />
          <div className="bg-[#2E7D32]" />
          <div className="bg-[#F9A825]" />
        </div>
      )}

      <div className="absolute top-1.5 left-2 flex flex-col items-center">
        <span className={cn("font-bold text-white drop-shadow-md leading-none", dimensions.text)}>
          {getCornerValue()}
        </span>
      </div>

      <div 
        className={cn(
          "absolute top-1/2 left-1/2 bg-white rounded-[50%] flex items-center justify-center",
          dimensions.oval
        )}
        style={{ 
          transform: "translate(-50%, -50%) rotate(-25deg)",
          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.15), 0 2px 4px rgba(255,255,255,0.1)",
        }}
      >
        <div 
          className="font-black flex items-center justify-center w-full h-full"
          style={{ 
            color: isWild ? "black" : baseColor, 
            fontSize: "280%",
            transform: "rotate(25deg)",
          }}
        >
          {renderCenterContent()}
        </div>
      </div>

      <div className="absolute bottom-1.5 right-2 flex flex-col items-center rotate-180">
        <span className={cn("font-bold text-white drop-shadow-md leading-none", dimensions.text)}>
          {getCornerValue()}
        </span>
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/5 to-transparent pointer-events-none rounded-xl" />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none rounded-xl" />

      {isHovered && isPlayable && !disabled && (
        <div className="absolute inset-0 bg-white/5 pointer-events-none rounded-xl" />
      )}
    </motion.div>
  );
}
