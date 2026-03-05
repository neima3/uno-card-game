"use client";

import { motion } from "framer-motion";

interface PlayerAvatarProps {
  displayName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const colorPalettes = [
  { bg: "from-[#D32F2F] to-[#B71C1C]", shadow: "rgba(211, 47, 47, 0.4)" },
  { bg: "from-[#1565C0] to-[#0D47A1]", shadow: "rgba(21, 101, 192, 0.4)" },
  { bg: "from-[#2E7D32] to-[#1B5E20]", shadow: "rgba(46, 125, 50, 0.4)" },
  { bg: "from-[#F9A825] to-[#F57F17]", shadow: "rgba(249, 168, 37, 0.4)" },
  { bg: "from-[#8E24AA] to-[#6A1B9A]", shadow: "rgba(142, 36, 170, 0.4)" },
  { bg: "from-[#EF6C00] to-[#E65100]", shadow: "rgba(239, 108, 0, 0.4)" },
  { bg: "from-[#00838F] to-[#006064]", shadow: "rgba(0, 131, 143, 0.4)" },
  { bg: "from-[#C62828] to-[#8E0000]", shadow: "rgba(198, 40, 40, 0.4)" },
];

export function PlayerAvatar({ displayName, size = "md", className = "" }: PlayerAvatarProps) {
  const colorIndex = displayName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colorPalettes.length;
  const palette = colorPalettes[colorIndex];
  const initial = displayName.charAt(0).toUpperCase();

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-20 h-20 text-3xl",
  }[size];

  return (
    <div 
      className={`rounded-full flex items-center justify-center font-bold text-white border-2 border-white/30 bg-gradient-to-br ${palette.bg} ${sizeClasses} ${className}`}
      style={{
        boxShadow: `0 4px 12px ${palette.shadow}, inset 0 1px 0 rgba(255,255,255,0.2)`,
      }}
    >
      <span style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
        {initial}
      </span>
    </div>
  );
}
