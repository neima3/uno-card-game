"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PlayerAvatar } from "@/components/game/PlayerAvatar";
import { Copy, Users, Crown, ArrowLeft, Play, Check, Loader2 } from "lucide-react";

interface LobbyPlayer {
  id: string;
  displayName: string;
  isAi: boolean;
  seatOrder: number;
}

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.roomCode as string;
  
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);
  const playerId = typeof window !== "undefined" ? localStorage.getItem("playerId") : null;

  const fetchLobbyState = useCallback(async () => {
    try {
      const response = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "get_state",
          roomCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to fetch lobby");
        router.push("/");
        return;
      }

      if (data.game.status === "playing") {
        router.push(`/game/${roomCode}`);
        return;
      }

      setPlayers(data.game.players);
    } catch (error) {
      toast.error("Failed to fetch lobby state");
    } finally {
      setLoading(false);
    }
  }, [roomCode, router]);

  useEffect(() => {
    fetchLobbyState();
    const interval = setInterval(fetchLobbyState, 2000);
    return () => clearInterval(interval);
  }, [fetchLobbyState]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      toast.success("Room code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/lobby/${roomCode}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copied!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleStartGame = async () => {
    if (players.length < 2) {
      toast.error("Need at least 2 players to start");
      return;
    }

    setStarting(true);
    try {
      const response = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "start_game",
          roomCode,
          playerId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to start game");
        setStarting(false);
        return;
      }

      router.push(`/game/${roomCode}`);
    } catch (error) {
      toast.error("Failed to start game");
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--bg-deep)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-white/20 border-t-[var(--uno-red)] rounded-full"
        />
      </main>
    );
  }

  const isHost = players[0]?.id === playerId;

  return (
    <main className="min-h-screen flex flex-col p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push("/")}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-white">Game Lobby</h1>
      </motion.div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 sm:gap-8 max-w-lg mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark rounded-2xl p-6 sm:p-8 w-full text-center"
        >
          <p className="text-white/50 text-sm mb-3 tracking-wide uppercase">Room Code</p>
          <div className="flex items-center justify-center gap-3">
            <span 
              className="text-4xl sm:text-5xl font-black text-white tracking-[0.2em]"
              style={{
                textShadow: "0 0 30px rgba(255,255,255,0.2)",
              }}
            >
              {roomCode}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyCode}
              className={`rounded-full ${copied ? "text-green-400" : "text-white/70 hover:text-white"}`}
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="mt-4 text-xs border-white/20 text-white/60 hover:text-white hover:bg-white/10"
          >
            Copy invite link
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-dark rounded-2xl p-6 w-full"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-white/60" />
            <span className="text-white/60 text-sm">
              Players ({players.length}/6)
            </span>
          </div>

          <div className="space-y-2">
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors"
              >
                <PlayerAvatar displayName={player.displayName} size="md" />
                <span className="text-white font-medium flex-1">
                  {player.displayName}
                  {player.isAi && (
                    <span className="text-white/40 text-sm ml-2">(AI)</span>
                  )}
                </span>
                {index === 0 && (
                  <span className="flex items-center gap-1 text-[var(--uno-yellow)] text-sm font-medium">
                    <Crown className="w-4 h-4" />
                    Host
                  </span>
                )}
                {player.id === playerId && (
                  <span className="text-[var(--uno-green)] text-sm font-medium">You</span>
                )}
              </motion.div>
            ))}
          </div>

          {players.length < 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 p-3 rounded-xl bg-[var(--uno-yellow)]/10 border border-[var(--uno-yellow)]/20"
            >
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-[var(--uno-yellow)] text-sm text-center font-medium"
              >
                Waiting for at least 2 players...
              </motion.p>
            </motion.div>
          )}
        </motion.div>

        {isHost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full"
          >
            <Button
              size="lg"
              className="w-full h-14 bg-gradient-to-r from-[var(--uno-green)] to-emerald-600 hover:from-[var(--uno-green)]/90 hover:to-emerald-600/90 font-bold text-lg shadow-lg shadow-green-500/25"
              onClick={handleStartGame}
              disabled={starting || players.length < 2}
            >
              {starting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start Game
                </>
              )}
            </Button>
          </motion.div>
        )}

        {!isHost && players.length >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <motion.div
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-2 text-white/50 text-sm"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Waiting for host to start...
            </motion.div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
