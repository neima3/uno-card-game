"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, User, Users, Play, Gamepad2, ChevronRight, Sparkles } from "lucide-react";

const FloatingCard = ({ delay, color, style }: { delay: number; color: string; style: React.CSSProperties }) => (
  <motion.div
    initial={{ y: 100, opacity: 0, rotate: -20 }}
    animate={{ 
      y: [-20, 20, -20],
      opacity: [0.3, 0.6, 0.3],
      rotate: [-5, 5, -5],
    }}
    transition={{
      duration: 6,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    className="absolute pointer-events-none"
    style={style}
  >
    <div 
      className="w-16 h-24 lg:w-20 lg:h-28 rounded-xl shadow-2xl"
      style={{ 
        background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
        boxShadow: `0 20px 40px ${color}40`,
      }}
    >
      <div className="absolute inset-2 bg-white/90 rounded-lg" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-xl" />
    </div>
  </motion.div>
);

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"computer" | "friends">("computer");
  
  const [displayName, setDisplayName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [aiCount, setAiCount] = useState(3);
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
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
      
      if (!isVsComputer && roomCode.length > 0) {
        if (roomCode.length !== 6) {
          toast.error("Invalid Room Code");
          setLoading(false);
          return;
        }
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
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#0a0a12]">
      <div className="absolute inset-0 bg-mesh pointer-events-none" />

      <FloatingCard delay={0} color="#D32F2F" style={{ top: "15%", left: "10%", transform: "rotate(-15deg)" }} />
      <FloatingCard delay={1} color="#1565C0" style={{ top: "20%", right: "15%", transform: "rotate(10deg)" }} />
      <FloatingCard delay={2} color="#2E7D32" style={{ bottom: "25%", left: "8%", transform: "rotate(5deg)" }} />
      <FloatingCard delay={3} color="#F9A825" style={{ bottom: "30%", right: "10%", transform: "rotate(-8deg)" }} />
      <FloatingCard delay={0.5} color="#D32F2F" style={{ top: "60%", left: "20%", transform: "rotate(20deg)" }} />
      <FloatingCard delay={1.5} color="#1565C0" style={{ top: "50%", right: "20%", transform: "rotate(-12deg)" }} />

      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative mb-10 lg:mb-14 transform hover:scale-105 transition-transform duration-500 cursor-default z-10"
      >
        <div className="relative">
          <motion.h1 
            className="text-7xl sm:text-8xl lg:text-9xl font-black italic tracking-tighter"
            style={{ 
              background: "linear-gradient(135deg, #F9A825 0%, #D32F2F 50%, #1565C0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 10px 30px rgba(211, 47, 47, 0.4))",
            }}
          >
            UNO
          </motion.h1>
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
            className="absolute -bottom-3 right-0 lg:-bottom-4"
          >
            <div className="bg-gradient-to-r from-[#F9A825] to-[#F57F17] text-black text-[10px] lg:text-xs font-black px-2.5 py-1 rounded-full rotate-[-5deg] shadow-lg flex items-center gap-1">
              <Sparkles size={12} />
              REMASTERED
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md glass-strong border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-20"
        style={{
          boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 100px rgba(211, 47, 47, 0.1)",
        }}
      >
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
              className="w-full bg-black/30 border-2 border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/20 font-bold focus:outline-none focus:border-[#F9A825]/50 focus:bg-black/50 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1.5 bg-black/40 rounded-2xl mb-6 relative">
          <motion.div 
            className="absolute top-1.5 bottom-1.5 bg-white/10 rounded-xl"
            layoutId="activeTab"
            initial={false}
            animate={{ 
              left: activeTab === "computer" ? "6px" : "50%", 
              width: "calc(50% - 6px)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
          
          <button 
            onClick={() => setActiveTab("computer")}
            className={`relative z-10 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-colors ${
              activeTab === "computer" ? "text-white" : "text-white/40 hover:text-white/60"
            }`}
          >
            <Gamepad2 size={18} />
            Single
          </button>
          <button 
            onClick={() => setActiveTab("friends")}
            className={`relative z-10 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-colors ${
              activeTab === "friends" ? "text-white" : "text-white/40 hover:text-white/60"
            }`}
          >
            <Users size={18} />
            Multi
          </button>
        </div>

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
                    <span>AI Opponents</span>
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
              
              <motion.button 
                onClick={handleStartGame}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-[#D32F2F] to-[#C62828] text-white font-black text-lg py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 group"
                style={{
                  boxShadow: "0 8px 32px rgba(211, 47, 47, 0.3)",
                }}
              >
                {loading ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" />}
                START GAME
              </motion.button>
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
                  <label className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2 block ml-1">
                    Room Code (Optional)
                  </label>
                  <input 
                    type="text" 
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="ex. A1B2C3"
                    maxLength={6}
                    className="w-full bg-black/30 border-2 border-white/10 rounded-2xl py-4 text-center text-xl tracking-[0.2em] font-mono text-white placeholder-white/20 focus:outline-none focus:border-[#1565C0]/50 transition-all uppercase"
                  />
                </div>
              </div>

              <motion.button 
                onClick={handleStartGame}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full font-black text-lg py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 ${
                  roomCode.length === 6 
                    ? "bg-gradient-to-r from-[#1565C0] to-[#0D47A1] text-white" 
                    : "bg-white text-black hover:bg-gray-100"
                }`}
                style={roomCode.length === 6 ? {
                  boxShadow: "0 8px 32px rgba(21, 101, 192, 0.3)",
                } : {}}
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  roomCode.length === 6 ? "JOIN ROOM" : "CREATE ROOM"
                )}
                {!loading && <ChevronRight />}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex items-center gap-4 text-white/20 text-xs font-medium tracking-widest"
      >
        <span>NO LOGIN</span>
        <span className="w-1 h-1 rounded-full bg-white/20" />
        <span>NO ADS</span>
        <span className="w-1 h-1 rounded-full bg-white/20" />
        <span>JUST UNO</span>
      </motion.div>
    </main>
  );
}
