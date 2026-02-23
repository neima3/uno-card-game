"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, User, Users, Play, Gamepad2, ChevronRight } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"computer" | "friends">("computer");
  
  // Form State
  const [displayName, setDisplayName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [aiCount, setAiCount] = useState(3); // Default 3 opponents
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved name
    const savedName = localStorage.getItem("playerName");
    if (savedName) setDisplayName(savedName);
  }, []);

  const handleStartGame = async () => {
    if (!displayName.trim()) {
        toast.error("Please enter your name");
        return;
    }

    setLoading(true);
    try {
        const isVsComputer = activeTab === "computer";
        
        // If joining a room
        if (!isVsComputer && roomCode.length > 0) {
            if (roomCode.length !== 6) {
                toast.error("Invalid Room Code");
                setLoading(false);
                return;
            }
            // Join Logic
            const res = await fetch("/api/game", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    event: "join_room",
                    roomCode: roomCode.toUpperCase(),
                    displayName: displayName.trim()
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            localStorage.setItem("playerId", data.playerId);
            localStorage.setItem("playerName", displayName.trim());
            router.push(`/lobby/${roomCode.toUpperCase()}`);
            return;
        }

        // Create Room (Vs Computer or Host Friends)
        const res = await fetch("/api/game", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                event: "create_room",
                displayName: displayName.trim(),
                vsComputer: isVsComputer,
                aiCount: isVsComputer ? aiCount : 0,
                aiDifficulty: isVsComputer ? difficulty : undefined
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        localStorage.setItem("playerId", data.playerId);
        localStorage.setItem("playerName", displayName.trim());

        if (isVsComputer) {
            router.push(`/game/${data.roomCode}`);
        } else {
            router.push(`/lobby/${data.roomCode}`);
        }

    } catch (e: any) {
        toast.error(e.message || "Something went wrong");
        setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#0f1218]">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* 3D Logo Container */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative mb-12 transform hover:scale-105 transition-transform duration-500 cursor-default"
      >
        <div className="relative z-10">
             <h1 className="text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[#F9A825] via-[#D32F2F] to-[#1565C0] drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                 style={{ 
                     WebkitTextStroke: "2px rgba(255,255,255,0.1)",
                     filter: "drop-shadow(0 0 30px rgba(211, 47, 47, 0.4))" 
                 }}>
                UNO
             </h1>
             <div className="absolute -bottom-4 right-0 bg-white text-black text-xs font-bold px-2 py-0.5 rounded rotate-[-5deg] shadow-lg">
                REMASTERED
             </div>
        </div>
      </motion.div>

      {/* Main Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-20"
      >
        {/* Name Input */}
        <div className="mb-8">
            <label className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2 block ml-1">Player Name</label>
            <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#F9A825] transition-colors" size={20} />
                <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    maxLength={15}
                    className="w-full bg-black/20 border-2 border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/20 font-bold focus:outline-none focus:border-[#F9A825]/50 focus:bg-black/40 transition-all"
                />
            </div>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-black/30 rounded-2xl mb-6 relative">
            {/* Active Indicator */}
            <motion.div 
                className="absolute top-1 bottom-1 bg-white/10 rounded-xl shadow-sm"
                layoutId="activeTab"
                initial={false}
                animate={{ 
                    left: activeTab === "computer" ? "4px" : "50%", 
                    width: "calc(50% - 4px)",
                    x: activeTab === "friends" ? "0%" : "0" 
                }}
            />
            
            <button 
                onClick={() => setActiveTab("computer")}
                className={`relative z-10 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-colors ${activeTab === "computer" ? "text-white" : "text-white/40 hover:text-white/60"}`}
            >
                <Gamepad2 size={18} />
                Single
            </button>
            <button 
                onClick={() => setActiveTab("friends")}
                className={`relative z-10 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-colors ${activeTab === "friends" ? "text-white" : "text-white/40 hover:text-white/60"}`}
            >
                <Users size={18} />
                Multi
            </button>
        </div>

        {/* Dynamic Content */}
        <AnimatePresence mode="wait">
            {activeTab === "computer" ? (
                <motion.div 
                    key="computer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                >
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs font-bold text-white/40 mb-2 uppercase tracking-wider">
                                <span>Opponents</span>
                                <span className="text-[#F9A825]">{aiCount}</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" 
                                max="5" 
                                value={aiCount}
                                onChange={(e) => setAiCount(parseInt(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#F9A825]"
                            />
                            <div className="flex justify-between text-[10px] text-white/20 mt-1 px-1">
                                <span>1</span><span>3</span><span>5</span>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleStartGame}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#D32F2F] to-[#C62828] text-white font-black text-lg py-4 rounded-2xl shadow-lg hover:shadow-red-900/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" />}
                        START GAME
                    </button>
                </motion.div>
            ) : (
                <motion.div 
                    key="friends"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                >
                     <div className="space-y-4">
                        <div>
                            <label className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2 block ml-1">Room Code (Optional)</label>
                            <input 
                                type="text" 
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                placeholder="ex. A1B2C3"
                                maxLength={6}
                                className="w-full bg-black/20 border-2 border-white/10 rounded-2xl py-4 text-center text-xl tracking-[0.2em] font-mono text-white placeholder-white/20 focus:outline-none focus:border-[#1565C0]/50 transition-all uppercase"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleStartGame}
                        disabled={loading}
                        className={`w-full font-black text-lg py-4 rounded-2xl shadow-lg transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                            roomCode.length === 6 
                            ? "bg-[#1565C0] hover:bg-[#1976D2] text-white" 
                            : "bg-white text-black hover:bg-gray-100"
                        }`}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (
                            roomCode.length === 6 ? "JOIN ROOM" : "CREATE ROOM"
                        )}
                        {!loading && <ChevronRight />}
                    </button>
                </motion.div>
            )}
        </AnimatePresence>

      </motion.div>

      {/* Footer */}
      <div className="mt-8 text-white/20 text-xs font-medium tracking-widest text-center">
        NO LOGIN • NO ADS • JUST UNO
      </div>
    </main>
  );
}
