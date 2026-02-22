"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Users, Bot, Play, Copy, Check } from "lucide-react";
import Image from "next/image";

const floatingCards = [
  { color: "red", value: "7", rotation: -15, delay: 0, x: "5%", y: "15%" },
  { color: "blue", value: "skip", rotation: 20, delay: 0.5, x: "85%", y: "20%" },
  { color: "green", value: "reverse", rotation: -10, delay: 1, x: "10%", y: "70%" },
  { color: "yellow", value: "draw2", rotation: 25, delay: 1.5, x: "90%", y: "65%" },
  { color: "wild", value: "wild", rotation: 15, delay: 2, x: "50%", y: "85%" },
];

const cardColors: Record<string, string> = {
  red: "#FF2B2B",
  blue: "#1A8CFF",
  green: "#00CC66",
  yellow: "#FFD700",
  wild: "#9B59B6",
};

function FloatingCard({ color, value, rotation, delay, x, y }: typeof floatingCards[0]) {
  const displayValue = value === "skip" ? "⊘" : value === "reverse" ? "⟲" : value === "draw2" ? "+2" : value === "wild" ? "W" : value;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ 
        opacity: 0.15,
        y: 0,
      }}
      transition={{ delay, duration: 1 }}
      className="absolute pointer-events-none hidden sm:block"
      style={{ 
        left: x, 
        top: y,
        filter: "blur(2px)",
      }}
    >
      <motion.div
        animate={{
          rotate: [rotation - 3, rotation + 3, rotation - 3],
          y: [0, -10, 0],
        }}
        transition={{
          duration: 5 + delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl overflow-hidden"
        style={{
          background: color === "wild" 
            ? "conic-gradient(from 0deg, #FF2B2B, #1A8CFF, #00CC66, #FFD700, #FF2B2B)"
            : cardColors[color],
          transform: `rotate(${rotation}deg)`,
          boxShadow: `0 0 30px ${cardColors[color]}40`,
        }}
      >
        <div className="absolute inset-1 rounded-lg bg-black/30 flex items-center justify-center">
          <span className="text-white font-black text-xl">{displayValue}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DifficultyBadge({ difficulty, selected, onClick }: { difficulty: string; selected: boolean; onClick: () => void }) {
  const colors: Record<string, string> = {
    easy: "bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30",
    medium: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/30",
    hard: "bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30",
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full border-2 transition-all capitalize font-semibold ${
        selected ? colors[difficulty] + " ring-2 ring-offset-2 ring-offset-[var(--bg-deep)]" : "bg-white/5 border-white/20 text-white/60 hover:bg-white/10"
      }`}
    >
      {difficulty}
    </button>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [aiCount, setAiCount] = useState(2);
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCreateRoom = async (vsComputer: boolean) => {
    if (!displayName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "create_room",
          displayName: displayName.trim(),
          vsComputer,
          aiCount: vsComputer ? aiCount : 0,
          aiDifficulty: vsComputer ? aiDifficulty : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to create room");
        return;
      }

      localStorage.setItem("playerId", data.playerId);
      localStorage.setItem("playerName", displayName.trim());

      if (vsComputer) {
        router.push(`/game/${data.roomCode}`);
      } else {
        router.push(`/lobby/${data.roomCode}`);
      }
    } catch (error) {
      toast.error("Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!displayName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!roomCode.trim() || roomCode.length !== 6) {
      toast.error("Please enter a valid 6-character room code");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "join_room",
          roomCode: roomCode.toUpperCase(),
          displayName: displayName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to join room");
        return;
      }

      localStorage.setItem("playerId", data.playerId);
      localStorage.setItem("playerName", displayName.trim());
      router.push(`/lobby/${roomCode.toUpperCase()}`);
    } catch (error) {
      toast.error("Failed to join room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {floatingCards.map((card, i) => (
        <FloatingCard key={i} {...card} />
      ))}

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-8 sm:mb-12 relative z-10"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block"
        >
          <Image
            src="/logo.png"
            alt="UNO"
            width={200}
            height={100}
            className="w-40 sm:w-56 md:w-64 h-auto drop-shadow-2xl"
            style={{
              filter: "drop-shadow(0 0 30px rgba(255,43,43,0.4)) drop-shadow(0 0 60px rgba(26,140,255,0.3))",
            }}
            priority
          />
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-white/50 text-sm sm:text-base mt-4 tracking-wide"
        >
          The classic card game, reimagined online
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="w-full max-w-md space-y-6 relative z-10"
      >
        <div>
          <label className="block text-white/60 text-sm mb-2 font-medium">
            Your Name
          </label>
          <Input
            placeholder="Enter your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={20}
            className="h-14 text-lg bg-white/5 border-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="lg"
                variant="outline"
                className="h-auto py-6 flex-col gap-2 bg-transparent border-2 border-white/30 hover:bg-white/10 hover:border-white/50 transition-all"
                disabled={loading}
              >
                <Users className="w-7 h-7" />
                <span className="font-bold">Play with Friends</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[var(--bg-surface)] border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white text-xl">Create a Room</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <p className="text-white/60 text-sm">
                  Create a room and share the code with your friends to play together.
                </p>
                <Button
                  onClick={() => handleCreateRoom(false)}
                  disabled={loading || !displayName.trim()}
                  className="w-full h-12 bg-white text-gray-900 hover:bg-gray-100 font-bold"
                >
                  {loading ? "Creating..." : "Create Room"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="h-auto py-6 flex-col gap-2 bg-gradient-to-br from-[var(--uno-red)] to-orange-600 hover:from-[var(--uno-red)]/90 hover:to-orange-600/90 border-0 shadow-lg shadow-red-500/25 transition-all"
                disabled={loading}
              >
                <Bot className="w-7 h-7" />
                <span className="font-bold">vs Computer</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[var(--bg-surface)] border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white text-xl">Play vs Computer</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div>
                  <label className="block text-white/60 text-sm mb-3 font-medium">
                    AI Opponents
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        onClick={() => setAiCount(num)}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                          aiCount === num
                            ? "bg-white text-gray-900"
                            : "bg-white/10 text-white/70 hover:bg-white/20"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white/60 text-sm mb-3 font-medium">
                    Difficulty
                  </label>
                  <div className="flex gap-2">
                    {(["easy", "medium", "hard"] as const).map((diff) => (
                      <DifficultyBadge
                        key={diff}
                        difficulty={diff}
                        selected={aiDifficulty === diff}
                        onClick={() => setAiDifficulty(diff)}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => handleCreateRoom(true)}
                  disabled={loading || !displayName.trim()}
                  className="w-full h-12 bg-gradient-to-r from-[var(--uno-red)] to-orange-600 hover:from-[var(--uno-red)]/90 hover:to-orange-600/90 font-bold"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {loading ? "Starting..." : "Start Game"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/15" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-[var(--bg-deep)] text-white/30 text-sm">
              Have a code?
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <Input
            placeholder="Enter 6-character code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="h-14 text-center text-xl tracking-[0.3em] font-mono bg-white/5 border-white/20 focus:border-white/40"
          />
          <Button
            variant="outline"
            className="w-full h-12 border-white/20 hover:bg-white/10 font-semibold"
            onClick={handleJoinRoom}
            disabled={loading || !displayName.trim()}
          >
            Join Room
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-10 sm:mt-14 text-center relative z-10"
      >
        <p className="text-white/30 text-xs sm:text-sm tracking-wider">
          2-6 players • No signup • Free forever
        </p>
      </motion.div>
    </main>
  );
}
