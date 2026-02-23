"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { PlayerAvatar } from "@/components/game/PlayerAvatar";
import { Copy, ArrowLeft, Play, Loader2, Share2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        body: JSON.stringify({ event: "get_state", roomCode }),
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
      console.error(error);
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
      toast.error("Need at least 2 players!");
      return;
    }
    setStarting(true);
    try {
      await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "start_game", roomCode, playerId }),
      });
      router.push(`/game/${roomCode}`);
    } catch (e) {
      toast.error("Failed to start");
      setStarting(false);
    }
  };

  const isHost = players[0]?.id === playerId;

  if (loading) return (
      <div className="min-h-screen bg-[#0f1218] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
      </div>
  );

  return (
    <main className="min-h-screen bg-[#0f1218] flex flex-col items-center p-4 relative overflow-hidden">
       {/* Background */}
       <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-[#0f1218] pointer-events-none" />
       
       {/* Header */}
       <header className="w-full max-w-lg flex items-center justify-between py-6 relative z-10">
           <button onClick={() => router.push("/")} className="text-white/60 hover:text-white transition-colors">
               <ArrowLeft size={24} />
           </button>
           <span className="text-white/40 font-bold tracking-widest text-xs">LOBBY</span>
           <div className="w-6" /> {/* Spacer */}
       </header>

       {/* Room Code Card */}
       <motion.div 
         initial={{ y: 20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         className="w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-6 text-center relative z-10"
       >
           <div className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">Room Code</div>
           <div className="text-6xl font-black text-white tracking-widest mb-6 font-mono drop-shadow-lg" onClick={handleCopyCode} style={{ cursor: "pointer" }}>
               {roomCode}
           </div>
           
           <div className="flex gap-3 justify-center">
               <button 
                  onClick={handleCopyCode}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors"
               >
                   <Copy size={16} /> Copy
               </button>
               <button 
                  onClick={() => {
                      navigator.share?.({ title: "Join UNO!", text: `Join my room: ${roomCode}`, url: window.location.href });
                  }}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors"
               >
                   <Share2 size={16} /> Share
               </button>
           </div>
       </motion.div>

       {/* Player List */}
       <motion.div 
         initial={{ y: 20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         transition={{ delay: 0.1 }}
         className="w-full max-w-lg flex-1 relative z-10"
       >
           <div className="flex justify-between items-end mb-4 px-2">
               <h2 className="text-white font-bold text-xl">Players</h2>
               <span className="text-white/40 font-mono">{players.length}/6</span>
           </div>

           <div className="space-y-3">
               <AnimatePresence>
                   {players.map((p, i) => (
                       <motion.div
                          key={p.id}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: 20, opacity: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center gap-4 hover:bg-white/10 transition-colors"
                       >
                           <PlayerAvatar displayName={p.displayName} size="md" />
                           <div className="flex-1">
                               <div className="text-white font-bold">{p.displayName}</div>
                               {p.isAi && <div className="text-white/40 text-xs">Bot</div>}
                           </div>
                           {i === 0 && <Crown size={20} className="text-yellow-500" />}
                       </motion.div>
                   ))}
               </AnimatePresence>
               
               {/* Waiting slots */}
               {Array.from({ length: Math.max(0, 6 - players.length) }).map((_, i) => (
                   <div key={`empty-${i}`} className="border-2 border-dashed border-white/5 rounded-2xl p-3 flex items-center gap-4 opacity-50">
                       <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
                       <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
                   </div>
               ))}
           </div>
       </motion.div>

       {/* Start Button */}
       <motion.div 
         initial={{ y: 50, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         transition={{ delay: 0.2 }}
         className="w-full max-w-lg py-6 relative z-10"
       >
           {isHost ? (
               <button 
                  onClick={handleStartGame}
                  disabled={starting || players.length < 2}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-black text-lg py-4 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
               >
                   {starting ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" />}
                   START GAME
               </button>
           ) : (
               <div className="text-center text-white/40 font-mono text-sm animate-pulse">
                   Waiting for host to start...
               </div>
           )}
       </motion.div>
    </main>
  );
}
