"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Volume2, VolumeX, Loader2 } from "lucide-react";

import { PlayerHand } from "@/components/game/PlayerHand";
import { DiscardPile } from "@/components/game/DiscardPile";
import { DrawPile } from "@/components/game/DrawPile";
import { OpponentSlot } from "@/components/game/OpponentHand";
import { TurnIndicator } from "@/components/game/TurnIndicator";
import { ColorPicker } from "@/components/game/ColorPicker";
import { WinScreen } from "@/components/game/WinScreen";
import { ActionLog, ActionLogEntry, createLogEntry } from "@/components/game/ActionLog";
import { UnoButton } from "@/components/game/UnoButton"; // Need to check if this exists/needs update

import { Card, CardColor, GameState, Player, getPlayableCards } from "@/lib/game-engine";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.roomCode as string;

  // Game State
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myHand, setMyHand] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [pendingWildCard, setPendingWildCard] = useState<Card | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasSaidUno, setHasSaidUno] = useState(false);
  const [actionLog, setActionLog] = useState<ActionLogEntry[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  
  const { playSound } = useSoundEffects();
  
  // Player ID from local storage
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>("Player");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPlayerId(localStorage.getItem("playerId"));
      setPlayerName(localStorage.getItem("playerName") || "Player");
    }
  }, []);

  const addLog = useCallback((message: string) => {
    setActionLog(prev => [...prev.slice(-10), createLogEntry(message)]);
  }, []);

  // Poll Game State
  const fetchGameState = useCallback(async () => {
    if (!playerId) return;

    try {
      const response = await fetch(`/api/game?roomCode=${roomCode}&playerId=${playerId}`);
      if (!response.ok) {
        if (response.status === 404) {
           setError("Room not found");
           router.push("/");
           return;
        }
        throw new Error("Failed to fetch");
      }
      
      const data = await response.json();
      
      if (data.gameState) {
        setGameState(prev => {
           // Detect changes for logs/sounds if needed
           if (prev && prev.currentPlayerIndex !== data.gameState.currentPlayerIndex) {
              // Turn changed
              const newCurrentPlayer = data.gameState.players[data.gameState.currentPlayerIndex];
              if (newCurrentPlayer.id === playerId && soundEnabled) {
                 playSound("play"); // Notification sound for "your turn"
              }
           }
           return data.gameState;
        });
        setMyHand(data.gameState.myHand || []);
        setIsAiThinking(false); // Reset thinking state on update
      }
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      // Don't block UI on poll fail, just retry
    }
  }, [playerId, roomCode, router, soundEnabled, playSound]);

  useEffect(() => {
    if (!playerId) return;
    fetchGameState();
    const interval = setInterval(fetchGameState, 2000); // 2s polling
    return () => clearInterval(interval);
  }, [fetchGameState, playerId]);


  // Actions
  const handlePlayCard = async (cardId: string) => {
    if (!gameState || !playerId) return;
    
    const card = myHand.find(c => c.id === cardId);
    if (!card) return;

    // Client-side validation for immediate feedback
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    const playable = getPlayableCards(myHand, topCard, gameState.currentColor);
    if (!playable.some(c => c.id === cardId)) {
        toast.error("Cannot play this card!");
        if (soundEnabled) playSound("error");
        return;
    }

    if (card.color === 'wild') {
        setPendingWildCard(card);
        return;
    }

    await executePlayCard(cardId);
  };

  const executePlayCard = async (cardId: string, chosenColor?: CardColor) => {
    if (!playerId) return;
    
    // Optimistic UI update could go here, but for now we rely on loading state
    setIsAiThinking(true); 

    try {
        const res = await fetch("/api/game", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                event: "play_card",
                roomCode,
                playerId,
                cardId,
                chosenColor
            })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        // Success
        setGameState(data.gameState);
        setMyHand(data.gameState.myHand);
        setPendingWildCard(null);
        
        if (soundEnabled) playSound("play");
        
        // Log
        const card = myHand.find(c => c.id === cardId);
        addLog(`You played ${card?.color} ${card?.value}`);

        // Reset Uno flag if we have more than 1 card now (should be 0 or >1, but strictly if we played and have 1 left, we need to have said UNO)
        // Actually, if we just played and now have 1 card, we should have said UNO *before* or *during*? 
        // The rule usually is: Say UNO when playing the second-to-last card.
        // Simplified: Button appears when you have 2 cards.
        
    } catch (e: any) {
        toast.error(e.message || "Failed to play card");
        setIsAiThinking(false);
    }
  };

  const handleDrawCard = async () => {
      if (!playerId || !gameState) return;
      
      try {
          const res = await fetch("/api/game", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ event: "draw_card", roomCode, playerId })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          
          setGameState(data.gameState);
          setMyHand(data.gameState.myHand);
          if (soundEnabled) playSound("draw");
          addLog("You drew a card");
      } catch (e: any) {
          toast.error(e.message);
      }
  };

  const handleSayUno = async () => {
    if (!playerId) return;
    try {
        await fetch("/api/game", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event: "say_uno", roomCode, playerId })
        });
        setHasSaidUno(true);
        addLog("You said UNO!");
        if (soundEnabled) playSound("uno");
    } catch (e) {
        toast.error("Failed to say UNO");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 text-white animate-spin" />
    </div>
  );

  if (error || !gameState) return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p>{error || "Game not found"}</p>
            <button onClick={() => router.push("/")} className="mt-4 px-4 py-2 bg-white text-black rounded">Go Home</button>
        </div>
    </div>
  );

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === playerId;
  const opponents = gameState.players.filter(p => p.id !== playerId);
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];
  const winner = gameState.winnerId ? gameState.players.find(p => p.id === gameState.winnerId) : null;
  const canDraw = isMyTurn && getPlayableCards(myHand, topCard, gameState.currentColor).length === 0;

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#0f1218] flex flex-col">
        {/* Background Gradients */}
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#1a1a1a] to-transparent opacity-50" />
            <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black to-transparent opacity-80" />
            
            {/* Ambient Color Glow based on current color */}
            <div className="absolute inset-0 transition-colors duration-1000 ease-in-out opacity-20"
                 style={{
                     background: gameState.currentColor === 'red' ? 'radial-gradient(circle at 50% 50%, #D32F2F 0%, transparent 70%)' :
                                 gameState.currentColor === 'blue' ? 'radial-gradient(circle at 50% 50%, #1565C0 0%, transparent 70%)' :
                                 gameState.currentColor === 'green' ? 'radial-gradient(circle at 50% 50%, #2E7D32 0%, transparent 70%)' :
                                 gameState.currentColor === 'yellow' ? 'radial-gradient(circle at 50% 50%, #F9A825 0%, transparent 70%)' : 
                                 'none'
                 }}
            />
        </div>

        {/* Turn Pulse Overlay */}
        <AnimatePresence>
            {isMyTurn && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 border-[6px] border-[#F9A825]/30 pointer-events-none z-50 rounded-lg animate-pulse"
                />
            )}
        </AnimatePresence>

        {/* Sticky Header */}
        <header className="relative z-40 h-14 flex items-center justify-between px-4 border-b border-white/5 bg-black/20 backdrop-blur-md">
            <div className="flex items-center gap-2">
                <button onClick={() => router.push("/")} className="p-2 -ml-2 text-white/60 hover:text-white">
                    <ArrowLeft size={20} />
                </button>
                <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-mono text-white/60 border border-white/5">
                    Room: <span className="text-white font-bold tracking-wider">{roomCode}</span>
                </div>
            </div>

            {/* Turn Status Center */}
            <div className="absolute left-1/2 -translate-x-1/2">
                {isMyTurn && (
                    <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-[#F9A825] text-black text-xs font-black px-4 py-1 rounded-full shadow-lg tracking-widest"
                    >
                        YOUR TURN
                    </motion.div>
                )}
            </div>

            <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 -mr-2 text-white/60 hover:text-white">
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
        </header>

        {/* Game Area */}
        <div className="flex-1 flex flex-col relative z-10">
            
            {/* Opponents Row */}
            <div className="h-28 sm:h-32 flex items-center justify-center gap-2 px-2 overflow-x-auto scrollbar-hide py-2">
                {opponents.map(opp => (
                    <OpponentSlot 
                        key={opp.id} 
                        opponent={opp} 
                        isCurrentTurn={gameState.players[gameState.currentPlayerIndex].id === opp.id} 
                    />
                ))}
            </div>

            {/* Center Field */}
            <div className="flex-1 flex flex-col items-center justify-start pt-4 sm:pt-8 gap-6">
                
                {/* Draw & Discard Row */}
                <div className="flex items-center gap-8 sm:gap-16">
                    <DrawPile 
                        count={gameState.drawPile.length} 
                        onDraw={handleDrawCard} 
                        canDraw={canDraw} 
                    />
                    
                    {/* Direction Indicator in between */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20 scale-150">
                         {/* Optional background graphic */}
                    </div>

                    <DiscardPile 
                        cards={gameState.discardPile} 
                        currentColor={gameState.currentColor} 
                    />
                </div>

                {/* Info Bar */}
                <div className="flex items-center justify-center gap-8 w-full px-4">
                     <TurnIndicator 
                        currentplayerName={currentPlayer.displayName} 
                        isMyTurn={isMyTurn}
                        direction={gameState.direction}
                     />
                     <div className="h-8 w-[1px] bg-white/10" />
                     <ActionLog entries={actionLog} />
                </div>

            </div>

            {/* Player Info Bar */}
            <div className="w-full px-4 py-2 flex items-center justify-between text-sm font-medium text-white/60 border-t border-white/5 bg-black/40 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_lime]" />
                    <span className="text-white">{playerName}</span>
                </div>
                
                {/* UNO Button Area */}
                <div className="flex items-center gap-4">
                    {(myHand.length <= 2 && !hasSaidUno) && (
                        <UnoButton onClick={handleSayUno} shouldPulse={myHand.length === 1} />
                    )}
                    <span>{myHand.length} Cards</span>
                </div>
            </div>

            {/* My Hand (Fixed at bottom) */}
            <div className="h-48 sm:h-56 w-full relative">
                 <PlayerHand 
                    cards={myHand} 
                    onPlayCard={handlePlayCard} 
                    topCard={topCard} 
                    currentColor={gameState.currentColor} 
                    isCurrentTurn={isMyTurn} 
                    saidUno={hasSaidUno} 
                 />
            </div>

        </div>

        {/* Overlays */}
        <AnimatePresence>
            {pendingWildCard && (
                <ColorPicker 
                    onSelect={(color) => {
                        if (pendingWildCard) executePlayCard(pendingWildCard.id, color);
                    }} 
                    onClose={() => setPendingWildCard(null)} 
                />
            )}
        </AnimatePresence>

        <AnimatePresence>
            {gameState.status === 'finished' && winner && (
                <WinScreen 
                    winner={winner} 
                    players={gameState.players} 
                    onPlayAgain={async () => {
                        // Reset logic handled in WinScreen or separate function
                        await fetch("/api/game", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ event: "start_game", roomCode, playerId })
                        });
                        // Optimistic reset or wait for poll
                    }} 
                    onExit={() => router.push("/")} 
                />
            )}
        </AnimatePresence>

    </main>
  );
}
