"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PlayerAvatar } from "@/components/game/PlayerAvatar";
import { Copy, Users, Crown, ArrowLeft, Play } from "lucide-react";

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

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast.success("Room code copied!");
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
      <main className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full"
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
        <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-white">Lobby</h1>
      </motion.div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 max-w-lg mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 w-full text-center"
        >
          <p className="text-white/60 text-sm mb-2">Room Code</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl font-black text-white tracking-widest">
              {roomCode}
            </span>
            <Button variant="ghost" size="icon" onClick={handleCopyCode}>
              <Copy className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-white/40 text-sm mt-3">
            Share this code with your friends
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 w-full"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-white/60" />
            <span className="text-white/60 text-sm">
              Players ({players.length}/6)
            </span>
          </div>

          <div className="space-y-3">
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
              >
                <PlayerAvatar displayName={player.displayName} size="md" />
                <span className="text-white font-medium flex-1">
                  {player.displayName}
                  {player.isAi && (
                    <span className="text-white/40 text-sm ml-2">(AI)</span>
                  )}
                </span>
                {index === 0 && (
                  <span className="flex items-center gap-1 text-yellow-400 text-sm">
                    <Crown className="w-4 h-4" />
                    Host
                  </span>
                )}
                {player.id === playerId && (
                  <span className="text-green-400 text-sm">You</span>
                )}
              </motion.div>
            ))}
          </div>

          {players.length < 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
            >
              <p className="text-yellow-400 text-sm text-center">
                Waiting for at least 2 players...
              </p>
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
              className="w-full"
              onClick={handleStartGame}
              disabled={starting || players.length < 2}
            >
              <Play className="w-5 h-5 mr-2" />
              {starting ? "Starting..." : "Start Game"}
            </Button>
          </motion.div>
        )}

        {!isHost && players.length >= 2 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white/60 text-sm"
          >
            Waiting for host to start the game...
          </motion.p>
        )}
      </div>
    </main>
  );
}
