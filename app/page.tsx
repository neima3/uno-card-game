"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
import { Users, Bot, Play } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [aiCount, setAiCount] = useState(2);
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [loading, setLoading] = useState(false);

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
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <motion.h1
          className="text-6xl sm:text-8xl font-black mb-4"
          animate={{
            textShadow: [
              "0 0 20px rgba(255,0,0,0.5)",
              "0 0 40px rgba(0,0,255,0.5)",
              "0 0 20px rgba(0,255,0,0.5)",
              "0 0 40px rgba(255,255,0,0.5)",
              "0 0 20px rgba(255,0,0,0.5)",
            ],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <span className="text-red-500">U</span>
          <span className="text-yellow-400">N</span>
          <span className="text-green-500">O</span>
        </motion.h1>
        <p className="text-white/60 text-lg">The classic card game, now online</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-md space-y-6"
      >
        <div>
          <label className="block text-white/70 text-sm mb-2">Your Name</label>
          <Input
            placeholder="Enter your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={20}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="h-auto py-4 flex-col gap-2"
                disabled={loading}
              >
                <Users className="w-6 h-6" />
                <span>Play with Friends</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a Room</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <p className="text-white/70 text-sm">
                  Create a room and share the code with your friends to play together.
                </p>
                <Button
                  onClick={() => handleCreateRoom(false)}
                  disabled={loading || !displayName.trim()}
                  className="w-full"
                >
                  {loading ? "Creating..." : "Create Room"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="h-auto py-4 flex-col gap-2"
                disabled={loading}
              >
                <Bot className="w-6 h-6" />
                <span>vs Computer</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Play vs Computer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    Number of AI Opponents
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <Button
                        key={num}
                        variant={aiCount === num ? "default" : "outline"}
                        onClick={() => setAiCount(num)}
                        className="flex-1"
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    Difficulty
                  </label>
                  <div className="flex gap-2">
                    {(["easy", "medium", "hard"] as const).map((diff) => (
                      <Button
                        key={diff}
                        variant={aiDifficulty === diff ? "default" : "outline"}
                        onClick={() => setAiDifficulty(diff)}
                        className="flex-1 capitalize"
                      >
                        {diff}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => handleCreateRoom(true)}
                  disabled={loading || !displayName.trim()}
                  className="w-full"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {loading ? "Starting..." : "Start Game"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-[#0a0a0a] text-white/40 text-sm">or</span>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            placeholder="Enter room code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="text-center text-lg tracking-widest"
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={handleJoinRoom}
            disabled={loading || !displayName.trim()}
          >
            Join Room
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 text-center text-white/40 text-sm"
      >
        <p>2-6 players | Free to play | No account needed</p>
      </motion.div>
    </main>
  );
}
