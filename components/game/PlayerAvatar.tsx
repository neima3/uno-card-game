"use client";

import { motion } from "framer-motion";
import { cn, getInitials, getAvatarColor } from "@/lib/utils";

interface PlayerAvatarProps {
  displayName: string;
  isCurrentTurn?: boolean;
  size?: "sm" | "md" | "lg";
}

export function PlayerAvatar({
  displayName,
  isCurrentTurn = false,
  size = "md",
}: PlayerAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
  };

  return (
    <motion.div
      animate={isCurrentTurn ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.5, repeat: isCurrentTurn ? Infinity : 0 }}
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white shadow-lg",
        sizeClasses[size],
        getAvatarColor(displayName),
        isCurrentTurn && "ring-4 ring-yellow-400 ring-offset-2 ring-offset-gray-900"
      )}
    >
      {getInitials(displayName)}
    </motion.div>
  );
}
