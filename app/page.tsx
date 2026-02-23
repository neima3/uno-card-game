"use client";

import { useState, useEffect } from "react";
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
import { Users, Bot, Play, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

const floatingCards = [
  { color: "red", value: "7", rotation: -12, delay: 0, x: "5%", y: "12%" },
  { color: "blue", value: "skip", rotation: 18, delay: 0.5, x: "88%", y: "18%" },
  { color: "green", value: "reverse", rotation: -8, delay: 1, x: "8%", y: "72%" },
  { color: "yellow", value: "draw2", rotation: 22, delay: 1.5, x: "90%", y: "68%" },
  { color: "wild", value: "wild4", rotation: 10, delay: 2, x: "50%", y: "88%" },
];

const cardColors: Record<string, string> = {
  red: "#E53935",
  blue: "#1E88E5",
  green: "#43A047",
  yellow: "#FDD835",
  wild: "#8E24AA",
};

function FloatingCard({ color, value, rotation, delay, x, y, mounted }: typeof floatingCards[0] & { mounted: boolean }) {
  const displayValue = value === "skip" ? "⊘" : value === "reverse" ? "⇄" : value === "draw2" ? "+2" : value === "wild4" ? "+4" : value;
  
  return (
    <motion.div
      initial={mounted ? { opacity: 0, y: 50 } : { opacity: 0.12, y: 0 }}
      animate={{ opacity: 0.12, y: 0 }}
      transition={{ delay, duration: 1 }}
      className="absolute pointer-events-none hidden sm:block"
      style={{ left: x, top: y }}
    >
      <motion.div
        animate={{
          rotate: [rotation - 3, rotation + 3, rotation - 3],
          y: [0, -12, 0],
        }}
        transition={{
          duration: 5 + delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-14 h-20 sm:w-18 sm:h-24 rounded-xl overflow-hidden"
        style={{
          background: color === "wild" 
            ? "linear-gradient(145deg, #424242 0%, #1a1a1a 100%)"
            : `linear-gradient(145deg, ${cardColors[color]} 0%, ${cardColors[color]}CC 100%)`,
          transform: `rotate(${rotation}deg)`,
          boxShadow: `0 8px 32px ${cardColors[color]}30`,
        }}
      >
        {color === "wild" && (
          <div 
            className="absolute inset-0"
            style={{
              background: "conic-gradient(from 0deg, #E53935 0deg 90deg, #1E88E5 90deg 180deg, #43A047 180deg 270deg, #FDD835 270deg 360deg)",
              opacity: 0.5,
            }}
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-black text-lg drop-shadow-lg">{displayValue}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function UnoLogo({ mounted }: { mounted: boolean }) {
  const letterColors = ["#E53935", "#FDD835", "#1E88E5"];
  const letterShadows = ["#E5393540", "#FDD83540", "#1E88E540"];
  
  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="inline-block"
      style={{ transform: "rotate(-5deg)" }}
    >
      <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight select-none drop-shadow-2xl">
        {["U", "N", "O"].map((letter, i) => (
          <motion.span
            key={letter}
            initial={mounted ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 + 0.2 }}
            className="inline-block italic"
            style={{
              color: letterColors[i],
              textShadow: `
                0 4px 20px ${letterShadows[i]},
                -2px -2px 0 #1a1a1a,
                2px -2px 0 #1a1a1a,
                -2px 2px 0 #1a1a1a,
                2px 2px 0 #1a1a1a,
                0 0 40px ${letterShadows[i]}
              `,
            }}
          >
            {letter}
          </motion.span>
        ))}
      </h1>
    </motion.div>
  );
}

function DifficultySelector({ 
  difficulty, 
  setDifficulty 
}: { 
  difficulty: "easy" | "medium" | "hard";
  setDifficulty: (d: "easy" | "medium" | "hard") => void;
}) {
  const options = [
    { value: "easy", label: "Easy", emoji: "🌱" },
    { value: "medium", label: "Medium", emoji: "⚔️" },
    { value: "hard", label: "Hard", emoji: "🔥" },
  ] as const;

  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setDifficulty(opt.value)}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all flex flex-col items-center gap-1 active:scale-95 ${
            difficulty === opt.value
              ? "bg-white text-gray-900 shadow-lg"
              : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
          }`}
        >
          <span className="text-lg">{opt.emoji}</span>
          <span className="text-sm">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [aiCount, setAiCount] = useState(2);
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [loading, setLoading] = useState(false);
  const [showVsComputerOptions, setShowVsComputerOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => setMounted(true), []);

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
      toast.error("Please enter a valid 6-character code");
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
    <main className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 10% 10%, rgba(229,57,53,0.15) 0%, transparent 40%),
              radial-gradient(ellipse at 90% 90%, rgba(30,136,229,0.15) 0%, transparent 40%),
              radial-gradient(ellipse at 50% 50%, rgba(142,36,170,0.08) 0%, transparent 50%)
            `,
          }}
        />
      </div>

      {floatingCards.map((card, i) => (
        <FloatingCard key={i} {...card} mounted={mounted} />
      ))}

      <motion.div
        initial={mounted ? { opacity: 0, y: -30 } : { opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-8 sm:mb-12 relative z-10"
      >
        <UnoLogo mounted={mounted} />
        
        <motion.p
          initial={mounted ? { opacity: 0 } : { opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white/50 text-sm sm:text-base mt-6 tracking-wide"
        >
          The classic card game, reimagined
        </motion.p>
      </motion.div>

      <motion.div
        initial={mounted ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="w-full max-w-md space-y-5 relative z-10"
      >
        <div>
          <label className="block text-white/60 text-sm mb-2 font-medium">
            Your Name
          </label>
          <div className="relative">
            <Input
              placeholder="Your name..."
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={20}
              className="h-14 sm:h-16 text-lg sm:text-xl bg-white/5 border-white/15 focus:border-white/30 focus:ring-2 focus:ring-white/10 transition-all placeholder:text-white/30 pr-14"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-xs font-mono">
              {displayName.length}/20
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              if (!displayName.trim()) {
                toast.error("Please enter your name");
                return;
              }
              setShowVsComputerOptions(!showVsComputerOptions);
            }}
            disabled={loading}
            className="w-full h-16 sm:h-18 rounded-2xl font-bold text-lg sm:text-xl transition-all active:scale-[0.98] disabled:opacity-50 relative overflow-hidden group"
            style={{
              background: "linear-gradient(135deg, #E53935 0%, #C62828 100%)",
              boxShadow: "0 8px 32px rgba(229,57,53,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
            <div className="flex items-center justify-center gap-3">
              <Bot className="w-6 h-6 sm:w-7 sm:h-7" />
              <span>vs Computer</span>
              {showVsComputerOptions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>

          <AnimatePresence>
            {showVsComputerOptions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-3 font-medium">
                      AI Opponents
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((num) => (
                        <button
                          key={num}
                          onClick={() => setAiCount(num)}
                          className={`flex-1 py-3 rounded-xl font-bold transition-all active:scale-95 ${
                            aiCount === num
                              ? "bg-white text-gray-900"
                              : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
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
                    <DifficultySelector 
                      difficulty={aiDifficulty} 
                      setDifficulty={setAiDifficulty} 
                    />
                  </div>

                  <Button
                    onClick={() => handleCreateRoom(true)}
                    disabled={loading || !displayName.trim()}
                    className="w-full h-14 bg-gradient-to-r from-[#E53935] to-[#C62828] hover:from-[#EF5350] hover:to-[#D32F2F] font-bold text-lg shadow-lg shadow-red-500/25 active:scale-[0.98] transition-transform"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {loading ? "Starting..." : "Start Game"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Dialog>
            <DialogTrigger asChild>
              <button
                disabled={loading}
                className="w-full h-14 sm:h-16 rounded-2xl font-bold text-base sm:text-lg transition-all active:scale-[0.98] disabled:opacity-50 border-2 border-white/20 hover:border-white/30 hover:bg-white/5"
              >
                <div className="flex items-center justify-center gap-3 text-white/80">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>Play with Friends</span>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a1a2e] border-white/10 sm:max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-white text-xl">Create a Room</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <p className="text-white/50 text-sm">
                  Create a room and share the code with friends to play together.
                </p>
                <Button
                  onClick={() => handleCreateRoom(false)}
                  disabled={loading || !displayName.trim()}
                  className="w-full h-12 bg-gradient-to-r from-[#1E88E5] to-[#1565C0] hover:from-[#42A5F5] hover:to-[#1976D2] font-bold shadow-lg shadow-blue-500/25"
                >
                  {loading ? "Creating..." : "Create Room"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <motion.div
          initial={mounted ? { opacity: 0 } : { opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-[var(--bg-deep)] text-white/30 text-sm">
              Have a code?
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={mounted ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <div className="relative">
            <Input
              placeholder="Enter 6-character code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="h-14 sm:h-16 text-center text-xl sm:text-2xl tracking-[0.3em] font-mono bg-white/5 border-white/15 focus:border-white/30 placeholder:text-white/25 placeholder:tracking-normal placeholder:text-base"
            />
          </div>
          <Button
            className="w-full h-12 border-white/15 hover:bg-white/5 font-semibold text-white/80 hover:text-white active:scale-[0.98] transition-all"
            variant="outline"
            onClick={handleJoinRoom}
            disabled={loading || !displayName.trim()}
          >
            Join Room
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={mounted ? { opacity: 0 } : { opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-10 sm:mt-14 text-center relative z-10"
      >
        <p className="text-white/25 text-xs sm:text-sm tracking-wider">
          2-6 players • No signup • Free forever
        </p>
      </motion.div>
    </main>
  );
}
