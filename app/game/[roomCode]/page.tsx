"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Volume2, VolumeX, Loader2, Users, RotateCcw } from "lucide-react";

import { PlayerHand } from "@/components/game/PlayerHand";
import { DiscardPile } from "@/components/game/DiscardPile";
import { DrawPile } from "@/components/game/DrawPile";
import { OpponentSlot, OpponentsContainer } from "@/components/game/OpponentHand";
import { TurnIndicator } from "@/components/game/TurnIndicator";
import { ColorPicker } from "@/components/game/ColorPicker";
import { WinScreen } from "@/components/game/WinScreen";
import { ActionLog, ActionLogEntry, createLogEntry } from "@/components/game/ActionLog";
import { UnoButton } from "@/components/game/UnoButton";

import { Card, CardColor, GameState, Player, getPlayableCards } from "@/lib/game-engine";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const AI_RETRY_TIMEOUT = 4000;
const MAX_RETRIES = 3;

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.roomCode as string;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myHand, setMyHand] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pendingWildCard, setPendingWildCard] = useState<Card | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasSaidUno, setHasSaidUno] = useState(false);
  const [actionLog, setActionLog] = useState<ActionLogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { playSound } = useSoundEffects();
  const retryCountRef = useRef(0);
  const lastActionTimeRef = useRef(0);

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>("Player");
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPlayerId(localStorage.getItem("playerId"));
      setPlayerName(localStorage.getItem("playerName") || "Player");
      
      const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
      checkDesktop();
      window.addEventListener('resize', checkDesktop);
      return () => window.removeEventListener('resize', checkDesktop);
    }
  }, []);

  const addLog = useCallback((message: string) => {
    setActionLog(prev => [...prev.slice(-10), createLogEntry(message)]);
  }, []);

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
          if (prev && prev.currentPlayerIndex !== data.gameState.currentPlayerIndex) {
            const newCurrentPlayer = data.gameState.players[data.gameState.currentPlayerIndex];
            if (newCurrentPlayer?.id === playerId && soundEnabled) {
              playSound("play");
            }
          }
          return data.gameState;
        });
        setMyHand(data.gameState.myHand || []);

        const currentPlayer = data.gameState.players[data.gameState.currentPlayerIndex];
        if (currentPlayer?.id === playerId) {
          setIsProcessing(false);
          retryCountRef.current = 0;
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("Poll error:", err);
    }
  }, [playerId, roomCode, router, soundEnabled, playSound]);

  useEffect(() => {
    if (!playerId) return;
    fetchGameState();
    const interval = setInterval(fetchGameState, 2000);
    return () => clearInterval(interval);
  }, [fetchGameState, playerId]);

  useEffect(() => {
    if (!isProcessing || !gameState) return;

    const timeout = setTimeout(() => {
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current++;
        console.log(`AI turn timeout, retry ${retryCountRef.current}/${MAX_RETRIES}`);
        fetchGameState();
      } else {
        setIsProcessing(false);
        retryCountRef.current = 0;
        toast.error("Game may be stuck. Try drawing or playing a card.");
      }
    }, AI_RETRY_TIMEOUT);

    return () => clearTimeout(timeout);
  }, [isProcessing, gameState, fetchGameState]);


  const handlePlayCard = async (cardId: string) => {
    if (!gameState || !playerId || isProcessing) return;

    const card = myHand.find(c => c.id === cardId);
    if (!card) return;

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

    setIsProcessing(true);
    lastActionTimeRef.current = Date.now();
    retryCountRef.current = 0;

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

      setGameState(data.gameState);
      setMyHand(data.gameState.myHand);
      setPendingWildCard(null);

      if (soundEnabled) playSound("play");

      const card = myHand.find(c => c.id === cardId);
      addLog(`You played ${card?.color} ${card?.value}`);

      const currentPlayer = data.gameState.players[data.gameState.currentPlayerIndex];
      if (currentPlayer?.id === playerId) {
        setIsProcessing(false);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to play card");
      setIsProcessing(false);
    }
  };

  const handleDrawCard = async () => {
    if (!playerId || !gameState || isProcessing) return;

    setIsProcessing(true);
    retryCountRef.current = 0;

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

      const currentPlayer = data.gameState.players[data.gameState.currentPlayerIndex];
      if (currentPlayer?.id === playerId) {
        setIsProcessing(false);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to draw card");
      setIsProcessing(false);
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
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a12]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#D32F2F] via-[#F9A825] to-[#1565C0]" />
      </motion.div>
    </div>
  );

  if (error || !gameState) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a12] text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-white/60">{error || "Game not found"}</p>
        <button onClick={() => router.push("/")} className="mt-6 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-white/90 transition">
          Go Home
        </button>
      </div>
    </div>
  );

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === playerId && !isProcessing;
  const opponents = gameState.players.filter(p => p.id !== playerId);
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];
  const winner = gameState.winnerId ? gameState.players.find(p => p.id === gameState.winnerId) : null;
  const playableCards = isMyTurn ? getPlayableCards(myHand, topCard, gameState.currentColor) : [];
  const canDraw = isMyTurn && playableCards.length === 0;

  const currentColorGlow = gameState.currentColor === 'red' ? 'rgba(211, 47, 47, 0.15)' :
                           gameState.currentColor === 'blue' ? 'rgba(21, 101, 192, 0.15)' :
                           gameState.currentColor === 'green' ? 'rgba(46, 125, 50, 0.15)' :
                           gameState.currentColor === 'yellow' ? 'rgba(249, 168, 37, 0.15)' : 'transparent';

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#0a0a12] flex flex-col">
      <div className="absolute inset-0 bg-mesh pointer-events-none" />

      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-1000 ease-in-out"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${currentColorGlow} 0%, transparent 50%)`,
        }}
      />

      <AnimatePresence>
        {isMyTurn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 border-[4px] border-[#F9A825]/20 pointer-events-none z-50 rounded-lg"
            style={{
              boxShadow: "inset 0 0 100px rgba(249, 168, 37, 0.05)",
            }}
          />
        )}
      </AnimatePresence>

      <header className="relative z-40 h-14 lg:h-16 flex items-center justify-between px-4 lg:px-6 border-b border-white/5 glass-dark">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/")} className="p-2 -ml-2 text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            <ArrowLeft size={20} />
          </button>
          <div className="glass px-3 py-1.5 rounded-lg text-xs font-mono text-white/50 border border-white/5">
            <span className="text-white/30">Room</span>
            <span className="text-white font-bold tracking-wider ml-2">{roomCode}</span>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
          <AnimatePresence mode="wait">
            {isMyTurn && (
              <motion.div
                initial={{ y: -20, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -20, opacity: 0, scale: 0.9 }}
                className="bg-gradient-to-r from-[#F9A825] to-[#F57F17] text-black text-xs font-black px-4 py-1.5 rounded-full shadow-lg tracking-wider"
                style={{ boxShadow: "0 0 20px rgba(249, 168, 37, 0.4)" }}
              >
                YOUR TURN
              </motion.div>
            )}
            {isProcessing && !isMyTurn && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="flex items-center gap-2 glass-strong text-white/70 text-xs font-bold px-4 py-1.5 rounded-full border border-white/10"
              >
                <Loader2 size={12} className="animate-spin" />
                <span>PROCESSING</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 -mr-2 text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col relative z-10">

        <OpponentsContainer 
          opponents={opponents} 
          currentPlayerId={playerId} 
          gameState={gameState} 
        />

        <div className="flex-1 flex flex-col items-center justify-center gap-4 lg:gap-6 px-4 py-4 lg:py-8">
          <div className="flex items-center gap-6 lg:gap-16">
            <DrawPile
              count={gameState.drawPile.length}
              onDraw={handleDrawCard}
              canDraw={canDraw}
            />

            <DiscardPile
              cards={gameState.discardPile}
              currentColor={gameState.currentColor}
            />
          </div>

          <div className="mobile-only flex flex-col items-center gap-3 w-full px-4">
            <TurnIndicator
              currentplayerName={currentPlayer?.displayName || "?"}
              isMyTurn={isMyTurn}
              direction={gameState.direction}
            />
            <ActionLog entries={actionLog} />
          </div>

          <div className="desktop-only flex items-center justify-center gap-6 w-full px-8">
            <TurnIndicator
              currentplayerName={currentPlayer?.displayName || "?"}
              isMyTurn={isMyTurn}
              direction={gameState.direction}
            />
            <div className="h-10 w-px bg-white/10" />
            <ActionLog entries={actionLog} maxVisible={3} />
          </div>
        </div>

        <div className="w-full px-4 lg:px-6 py-2 lg:py-3 flex items-center justify-between glass-dark border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" style={{ boxShadow: "0 0 10px rgba(34, 197, 94, 0.6)" }} />
            <span className="text-white font-medium text-sm">{playerName}</span>
          </div>

          <div className="flex items-center gap-4">
            {(myHand.length <= 2 && !hasSaidUno) && (
              <UnoButton onClick={handleSayUno} shouldPulse={myHand.length === 1} />
            )}
            <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
              <span className="text-lg font-bold text-white">{myHand.length}</span>
              <span>cards</span>
            </div>
          </div>
        </div>

        <div className="h-44 sm:h-52 lg:h-56 w-full relative">
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
              await fetch("/api/game", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ event: "start_game", roomCode, playerId })
              });
            }}
            onExit={() => router.push("/")}
          />
        )}
      </AnimatePresence>

    </main>
  );
}
