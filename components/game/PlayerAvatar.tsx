"use client";

import { motion } from "framer-motion";

interface PlayerAvatarProps {
  displayName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const colors = [
  "bg-[#D32F2F]", // Red
  "bg-[#1565C0]", // Blue
  "bg-[#2E7D32]", // Green
  "bg-[#F9A825]", // Yellow
  "bg-[#8E24AA]", // Purple
  "bg-[#EF6C00]", // Orange
];

export function PlayerAvatar({ displayName, size = "md", className = "" }: PlayerAvatarProps) {
  // Deterministic color based on name
  const colorIndex = displayName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const colorClass = colors[colorIndex];
  const initial = displayName.charAt(0).toUpperCase();

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-20 h-20 text-3xl",
  }[size];

  return (
    <div 
      className={`rounded-full flex items-center justify-center font-bold text-white shadow-lg border-2 border-white/20 ${colorClass} ${sizeClasses} ${className}`}
    >
      {initial}
    </div>
  );
}
