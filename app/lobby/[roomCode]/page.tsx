"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PlayerAvatar } from "@/components/game/PlayerAvatar";
import { Copy, Users, Crown, ArrowLeft, Play, Check, Loader2, Share2 } from "lucide-react";

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
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
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
      setLinkCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = async () => {
    const link = `${window.location.origin}/lobby/${roomCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my UNO game!",
          text: `Join my UNO game! Room code: ${roomCode}`,
          url: link,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
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
    <main className="min-h-screen min-h-[100dvh] flex flex-col p-4 sm:p-8 relative">
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 20% 20%, rgba(229,57,53,0.1) 0%, transparent 40%),
              radial-gradient(ellipse at 80% 80%, rgba(30,136,229,0.1) 0%, transparent 40%)
            `,
          }}
        />
      </div>

      <motion.div
        initial={mounted ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4 mb-8 relative z-10"
      >
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push("/")}
          className="text-white/70 hover:text-white hover:bg-white/10 w-10 h-10 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Game Lobby</h1>
          <p className="text-white/40 text-sm">Waiting for players...</p>
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 sm:gap-8 max-w-lg mx-auto w-full relative z-10">
        <motion.div
          initial={mounted ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark rounded-3xl p-6 sm:p-8 w-full text-center"
        >
          <p className="text-white/40 text-xs mb-3 tracking-widest uppercase font-medium">Room Code</p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleCopyCode}
              className="group relative"
            >
              <span 
                className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-[0.15em] transition-all group-hover:scale-105"
                style={{
                  textShadow: "0 0 40px rgba(255,255,255,0.3)",
                }}
              >
                {roomCode}
              </span>
              <div className="absolute -right-10 top-1/2 -translate-y-1/2">
                {copied ? (
                  <Check className="w-6 h-6 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors" />
                )}
              </div>
            </button>
          </div>
          <div className="flex items-center justify-center gap-3 mt-5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="text-xs border-white/20 text-white/60 hover:text-white hover:bg-white/10 h-9 px-4"
            >
              {linkCopied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Link Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="text-xs border-white/20 text-white/60 hover:text-white hover:bg-white/10 h-9 px-4"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={mounted ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-dark rounded-3xl p-5 sm:p-6 w-full"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-white/60" />
            <span className="text-white/60 text-sm font-medium">
              Players ({players.length}/6)
            </span>
          </div>

          <div className="space-y-2">
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={mounted ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl bg-white/5 hover:bg-white/8 transition-colors"
              >
                <PlayerAvatar displayName={player.displayName} size="md" />
                <span className="text-white font-medium flex-1 text-sm sm:text-base">
                  {player.displayName}
                  {player.isAi && (
                    <span className="text-white/40 text-sm ml-2">(AI)</span>
                  )}
                </span>
                {index === 0 && (
                  <span className="flex items-center gap-1.5 text-[#FDD835] text-xs sm:text-sm font-semibold">
                    <Crown className="w-4 h-4" />
                    Host
                  </span>
                )}
                {player.id === playerId && (
                  <span className="px-2 py-0.5 rounded-full bg-[#43A047]/20 text-[#43A047] text-xs font-semibold">
                    You
                  </span>
                )}
              </motion.div>
            ))}
          </div>

          {players.length < 2 && (
            <motion.div
              initial={mounted ? { opacity: 0 } : { opacity: 1 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 p-3 rounded-2xl bg-[#FDD835]/10 border border-[#FDD835]/20"
            >
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-[#FDD835] text-sm text-center font-medium"
              >
                Waiting for at least 2 players...
              </motion.p>
            </motion.div>
          )}
        </motion.div>

        {isHost && (
          <motion.div
            initial={mounted ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full"
          >
            <Button
              size="lg"
              className="w-full h-14 sm:h-16 bg-gradient-to-r from-[#43A047] to-[#2E7D32] hover:from-[#66BB6A] hover:to-[#388E3C] font-bold text-lg shadow-xl shadow-green-500/30 active:scale-[0.98] transition-all"
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
            initial={mounted ? { opacity: 0 } : { opacity: 1 }}
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
