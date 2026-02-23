"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { PlayerHand } from "@/components/game/PlayerHand";
import { DiscardPile } from "@/components/game/DiscardPile";
import { DrawPile } from "@/components/game/DrawPile";
import { TurnIndicator } from "@/components/game/TurnIndicator";
import { UnoButton } from "@/components/game/UnoButton";
import { ColorPicker } from "@/components/game/ColorPicker";
import { WinScreen } from "@/components/game/WinScreen";
import { ActionLog, ActionLogEntry, createLogEntry } from "@/components/game/ActionLog";
import { Button } from "@/components/ui/button";

import { Card, CardColor, GameState, Player, getPlayableCards } from "@/lib/game-engine";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { ArrowLeft, Volume2, VolumeX, RotateCw } from "lucide-react";

interface OpponentSlotProps {
  opponent: Player;
  isCurrentTurn: boolean;
  seatIndex: number;
}

const seatColors = [
  { bg: "#E53935", glow: "rgba(229,57,53,0.5)" },
  { bg: "#1E88E5", glow: "rgba(30,136,229,0.5)" },
  { bg: "#43A047", glow: "rgba(67,160,71,0.5)" },
  { bg: "#FDD835", glow: "rgba(253,216,53,0.5)" },
  { bg: "#8E24AA", glow: "rgba(142,36,170,0.5)" },
  { bg: "#FF7043", glow: "rgba(255,112,67,0.5)" },
];

function OpponentSlot({ opponent, isCurrentTurn, seatIndex }: OpponentSlotProps) {
  const seatColor = seatColors[seatIndex % seatColors.length];
  const initial = opponent.displayName.charAt(0).toUpperCase();
  const cardCount = opponent.hand.length;
  const maxVisible = 4;
  const visibleCards = Math.min(cardCount, maxVisible);
  const overlap = 14;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`relative flex flex-col items-center p-3 rounded-2xl transition-all ${
        isCurrentTurn 
          ? "bg-white/10 ring-2 ring-offset-2 ring-offset-transparent" 
          : "bg-white/5"
      }`}
      style={isCurrentTurn ? { 
        boxShadow: `0 0 30px ${seatColor.glow}, inset 0 0 20px ${seatColor.glow}`,
        borderColor: seatColor.bg,
      } : {}}
    >
      <motion.div
        animate={isCurrentTurn ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="relative mb-2"
      >
        <div
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg"
          style={{
            background: `linear-gradient(145deg, ${seatColor.bg}, ${seatColor.bg}CC)`,
            boxShadow: isCurrentTurn 
              ? `0 0 20px ${seatColor.glow}, 0 4px 12px rgba(0,0,0,0.3)`
              : "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          {initial}
        </div>
        {isCurrentTurn && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: `3px solid ${seatColor.bg}` }}
            animate={{ scale: [1, 1.4], opacity: [0.8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.div>

      <span className={`text-xs sm:text-sm font-semibold truncate max-w-[100px] mb-1 ${
        isCurrentTurn ? "text-white" : "text-white/70"
      }`}>
        {opponent.displayName}
      </span>

      <div className="flex items-center gap-1.5">
        <div className="flex items-center">
          {Array.from({ length: visibleCards }).map((_, i) => (
            <div
              key={i}
              className="relative"
              style={{ 
                marginLeft: i === 0 ? 0 : -overlap,
                zIndex: i,
              }}
            >
              <div 
                className="w-7 h-9 sm:w-8 sm:h-11 rounded-md overflow-hidden"
                style={{
                  background: "linear-gradient(145deg, #2D2D2D 0%, #1A1A1A 100%)",
                  border: "1px solid #444",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                <div className="absolute inset-0.5 rounded overflow-hidden">
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: "conic-gradient(from 0deg, #E5393530 0deg 90deg, #1E88E530 90deg 180deg, #43A04730 180deg 270deg, #FDD83530 270deg 360deg)",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="min-w-[24px] h-6 px-2 rounded-full bg-white text-gray-900 text-xs font-bold flex items-center justify-center shadow-md"
        >
          {cardCount}
        </motion.div>
      </div>

      {cardCount === 1 && opponent.hasSaidUno && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
          className="absolute -bottom-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#E53935] to-[#C62828] text-white text-[10px] font-bold tracking-wider shadow-lg"
          style={{ boxShadow: "0 0 20px rgba(229,57,53,0.6)" }}
        >
          UNO!
        </motion.div>
      )}

      {cardCount === 1 && !opponent.hasSaidUno && (
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#FF5722] text-white text-sm font-bold flex items-center justify-center shadow-lg"
        >
          !
        </motion.div>
      )}
    </motion.div>
  );
}

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.roomCode as string;
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myHand, setMyHand] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingWildCard, setPendingWildCard] = useState<Card | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasSaidUno, setHasSaidUno] = useState(false);
  const [pollFailures, setPollFailures] = useState(0);
  const [actionLog, setActionLog] = useState<ActionLogEntry[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [showTurnToast, setShowTurnToast] = useState(false);
  const prevTurnRef = useRef<string | null>(null);

  const { playSound } = useSoundEffects();

  const playerId = typeof window !== "undefined" ? localStorage.getItem("playerId") : null;
  const playerName = typeof window !== "undefined" ? localStorage.getItem("playerName") : "Player";

  const addLog = useCallback((message: string) => {
    setActionLog(prev => [...prev.slice(-10), createLogEntry(message)]);
  }, []);

  const fetchGameState = useCallback(async () => {
    if (!playerId) return;

    try {
      const response = await fetch(`/api/game?roomCode=${roomCode}&playerId=${playerId}`);
      const data = await response.json();

      if (!response.ok) {
        setPollFailures((prev) => prev + 1);
        if (pollFailures >= 2) {
          toast.error("Connection lost. Redirecting...");
          setTimeout(() => router.push("/"), 2000);
        }
        return;
      }

      setPollFailures(0);

      if (data.gameState.status === "waiting") {
        router.push(`/lobby/${roomCode}`);
        return;
      }

      const prevCurrentPlayer = gameState?.players[gameState.currentPlayerIndex]?.id;
      const newCurrentPlayer = data.gameState.players[data.gameState.currentPlayerIndex]?.id;

      if (prevCurrentPlayer !== newCurrentPlayer && newCurrentPlayer === playerId && gameState?.status === "playing") {
        setShowTurnToast(true);
        if (soundEnabled) playSound("play");
        setTimeout(() => setShowTurnToast(false), 2000);
      }

      if (gameState && data.gameState) {
        const prevPlayers = gameState.players;
        const newPlayers = data.gameState.players;
        
        const currentPlayerId = playerId;
        const prevMe = prevPlayers.find((p: Player) => p.id === currentPlayerId);
        const newMe = newPlayers.find((p: Player) => p.id === currentPlayerId);
        
        if (prevMe && newMe && newMe.hand.length > prevMe.hand.length) {
          const drawnCount = newMe.hand.length - prevMe.hand.length;
          if (drawnCount > 0) {
            toast(`You drew ${drawnCount} card${drawnCount > 1 ? 's' : ''}!`, { icon: "🃏" });
          }
        }
      }

      setGameState(data.gameState);
      setMyHand(data.gameState.myHand || []);
      setIsAiThinking(false);
    } catch (error) {
      setPollFailures((prev) => prev + 1);
      toast.error("Failed to fetch game state");
    } finally {
      setLoading(false);
    }
  }, [roomCode, router, playerId, pollFailures, gameState, soundEnabled, playSound]);

  useEffect(() => {
    fetchGameState();
    const interval = setInterval(fetchGameState, 3000);
    return () => clearInterval(interval);
  }, [fetchGameState]);

  const handlePlayCard = async (cardId: string) => {
    if (!gameState || !playerId) return;

    const card = myHand.find((c) => c.id === cardId);
    if (!card) return;

    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    const playableCards = getPlayableCards(myHand, topCard, gameState.currentColor);
    const isPlayable = playableCards.some((c) => c.id === cardId);

    if (!isPlayable) {
      if (soundEnabled) playSound("error");
      toast.error("You can't play this card!");
      return;
    }

    if (card.color === "wild") {
      setPendingWildCard(card);
      return;
    }

    await executePlayCard(cardId);
  };

  const executePlayCard = async (cardId: string, chosenColor?: CardColor) => {
    if (!playerId) return;

    setIsAiThinking(true);

    try {
      const response = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "play_card",
          roomCode,
          playerId,
          cardId,
          chosenColor,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsAiThinking(false);
        toast.error(data.error || "Failed to play card");
        return;
      }

      if (soundEnabled) {
        const card = myHand.find((c) => c.id === cardId);
        if (card?.value === "skip") playSound("skip");
        else if (card?.value === "reverse") playSound("reverse");
        else if (card?.value === "wild" || card?.value === "wild4") playSound("wild");
        else playSound("play");
      }

      const card = myHand.find((c) => c.id === cardId);
      const cardName = getCardDisplayName(card, chosenColor);
      addLog(`You played ${cardName}`);

      setGameState(data.gameState);
      setMyHand(data.gameState.myHand || []);
      setPendingWildCard(null);

      if (data.gameState.status === "finished") {
        setIsAiThinking(false);
      }

      if (myHand.length === 2 && !hasSaidUno) {
        toast("Don't forget to say UNO!", { icon: "⚠️" });
      }
    } catch (error) {
      setIsAiThinking(false);
      toast.error("Failed to play card");
    }
  };

  const handleDrawCard = async () => {
    if (!gameState || !playerId) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer?.id !== playerId) {
      toast.error("It's not your turn!");
      return;
    }

    setIsAiThinking(true);

    try {
      const response = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "draw_card",
          roomCode,
          playerId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsAiThinking(false);
        toast.error(data.error || "Failed to draw card");
        return;
      }

      if (soundEnabled) playSound("draw");

      addLog("You drew a card");

      setGameState(data.gameState);
      setMyHand(data.gameState.myHand || []);

      if (data.gameState.status === "finished") {
        setIsAiThinking(false);
      }
    } catch (error) {
      setIsAiThinking(false);
      toast.error("Failed to draw card");
    }
  };

  const handleSayUno = async () => {
    if (!playerId) return;

    try {
      const response = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "say_uno",
          roomCode,
          playerId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to say UNO");
        return;
      }

      if (soundEnabled) playSound("uno");
      setHasSaidUno(true);
      addLog("You said UNO!");
      setGameState(data.gameState);
    } catch (error) {
      toast.error("Failed to say UNO");
    }
  };

  const handleColorSelect = (color: CardColor) => {
    if (pendingWildCard) {
      executePlayCard(pendingWildCard.id, color);
    }
  };

  const handlePlayAgain = async () => {
    if (!playerId) return;

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

      if (response.ok) {
        setGameState(data.gameState);
        setMyHand(data.gameState.myHand || []);
        setHasSaidUno(false);
        setActionLog([]);
      }
    } catch (error) {
      toast.error("Failed to start new game");
    }
  };

  const getCardDisplayName = (card: Card | undefined, chosenColor?: CardColor): string => {
    if (!card) return "a card";
    const colorName = chosenColor || (card.color !== "wild" ? card.color : "");
    const valueNames: Record<string, string> = {
      skip: "Skip",
      reverse: "Reverse",
      draw2: "+2",
      wild: "Wild",
      wild4: "Wild +4",
    };
    const valueName = valueNames[card.value] || card.value;
    return colorName ? `${colorName} ${valueName}` : valueName;
  };

  if (loading || !gameState) {
    return (
      <main className="min-h-screen min-h-[100dvh] flex items-center justify-center game-bg">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-white/20 border-t-[#E53935] rounded-full"
        />
      </main>
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === playerId;
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];
  const winner = gameState.winnerId
    ? gameState.players.find((p) => p.id === gameState.winnerId)
    : null;

  const opponents = gameState.players.filter((p) => p.id !== playerId);

  const shouldShowUnoButton = myHand.length <= 2 && !hasSaidUno;
  const canDraw = isMyTurn && getPlayableCards(myHand, topCard, gameState.currentColor).length === 0;

  const currentColorStyle = gameState.currentColor && gameState.currentColor !== "wild"
    ? {
        red: { bg: "#E53935", glow: "var(--neon-glow-red)" },
        blue: { bg: "#1E88E5", glow: "var(--neon-glow-blue)" },
        green: { bg: "#43A047", glow: "var(--neon-glow-green)" },
        yellow: { bg: "#FDD835", glow: "var(--neon-glow-yellow)" },
      }[gameState.currentColor as "red" | "blue" | "green" | "yellow"]
    : null;

  return (
    <main className="min-h-screen min-h-[100dvh] flex flex-col relative overflow-hidden game-bg">
      <header className="relative z-20 flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 bg-black/20 backdrop-blur-sm">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push("/")}
          className="text-white/60 hover:text-white hover:bg-white/10 w-10 h-10 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <TurnIndicator
          currentplayerName={currentPlayer?.displayName || "Unknown"}
          message={isMyTurn ? "Your turn!" : undefined}
          isAi={currentPlayer?.isAi && !isMyTurn}
          direction={gameState.direction}
        />

        <div className="flex items-center gap-2">
          <span className="text-white/40 text-xs font-mono hidden sm:block">{roomCode}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-white/60 hover:text-white hover:bg-white/10 w-10 h-10 rounded-full"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col relative z-10 px-2 overflow-hidden">
        <div className="flex items-start justify-center gap-2 sm:gap-3 py-2 px-1 overflow-x-auto scrollbar-hide">
          {opponents.map((opponent, index) => (
            <OpponentSlot
              key={opponent.id}
              opponent={opponent}
              isCurrentTurn={gameState.players[gameState.currentPlayerIndex]?.id === opponent.id}
              seatIndex={index}
            />
          ))}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-4 sm:gap-6 px-4 py-4">
          <div className="flex items-center justify-center gap-8 sm:gap-16 lg:gap-24">
            <div className="flex flex-col items-center gap-2">
              <DrawPile
                count={gameState.drawPile.length}
                onDraw={handleDrawCard}
                canDraw={canDraw}
              />
            </div>

            <div className="flex flex-col items-center gap-3">
              {currentColorStyle && (
                <motion.div
                  initial={mounted ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative"
                >
                  <motion.div
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-3 border-white/40"
                    style={{ 
                      backgroundColor: currentColorStyle.bg,
                      boxShadow: currentColorStyle.glow,
                    }}
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ border: `2px solid ${currentColorStyle.bg}` }}
                    animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>
              )}
              
              <div className="flex items-center gap-1.5 text-white/40">
                <RotateCw className={`w-4 h-4 ${gameState.direction === 1 ? '' : 'scale-x-[-1]'}`} />
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <DiscardPile
                cards={gameState.discardPile}
                currentColor={gameState.currentColor}
              />
            </div>
          </div>

          <div className="w-full max-w-md">
            <ActionLog entries={actionLog} maxVisible={2} />
          </div>
        </div>
      </div>

      <div className="relative z-10 p-3 sm:p-4 pb-safe bg-gradient-to-t from-black/40 to-transparent">
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3">
          <motion.div
            initial={mounted ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full ${
              isMyTurn
                ? "bg-gradient-to-r from-[#FDD835] to-[#FFA000] text-gray-900 shadow-lg shadow-yellow-500/30"
                : "bg-white/10 text-white/70"
            }`}
          >
            <span className="font-bold text-sm sm:text-base">
              {playerName}
            </span>
            <span className={`text-sm sm:text-base font-bold ${isMyTurn ? 'text-gray-700' : 'text-white/50'}`}>
              ({myHand.length})
            </span>
          </motion.div>

          {shouldShowUnoButton && (
            <UnoButton
              onClick={handleSayUno}
              shouldPulse={myHand.length === 1}
            />
          )}
        </div>

        <PlayerHand
          cards={myHand}
          onPlayCard={handlePlayCard}
          topCard={topCard}
          currentColor={gameState.currentColor}
          isCurrentTurn={isMyTurn}
          saidUno={hasSaidUno}
        />
      </div>

      <AnimatePresence>
        {isMyTurn && showTurnToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="px-6 py-3 rounded-full bg-gradient-to-r from-[#FDD835] to-[#FFA000] text-gray-900 font-bold text-lg shadow-2xl shadow-yellow-500/40">
              YOUR TURN!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAiThinking && gameState.status !== "finished" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-sm pointer-events-none"
          >
            <div className="flex flex-col items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-3 border-white/20 border-t-white rounded-full"
              />
              <span className="text-white/80 text-sm font-medium">AI thinking...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingWildCard && (
          <ColorPicker
            onSelect={handleColorSelect}
            onClose={() => setPendingWildCard(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameState.status === "finished" && winner && (
          <WinScreen
            winner={winner}
            players={gameState.players}
            onPlayAgain={handlePlayAgain}
            onExit={() => router.push("/")}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
