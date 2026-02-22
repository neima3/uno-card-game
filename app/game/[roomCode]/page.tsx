"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { PlayerHand } from "@/components/game/PlayerHand";
import { OpponentHand } from "@/components/game/OpponentHand";
import { DiscardPile } from "@/components/game/DiscardPile";
import { DrawPile } from "@/components/game/DrawPile";
import { TurnIndicator } from "@/components/game/TurnIndicator";
import { UnoButton } from "@/components/game/UnoButton";
import { ColorPicker } from "@/components/game/ColorPicker";
import { WinScreen } from "@/components/game/WinScreen";
import { Button } from "@/components/ui/button";

import { Card, CardColor, GameState, Player, getPlayableCards } from "@/lib/game-engine";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { ArrowLeft, Volume2, VolumeX, LogOut } from "lucide-react";

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.roomCode as string;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myHand, setMyHand] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingWildCard, setPendingWildCard] = useState<Card | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasSaidUno, setHasSaidUno] = useState(false);
  const [pollFailures, setPollFailures] = useState(0);

  const { playSound } = useSoundEffects();

  const playerId = typeof window !== "undefined" ? localStorage.getItem("playerId") : null;
  const playerName = typeof window !== "undefined" ? localStorage.getItem("playerName") : "Player";

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

      setGameState(data.gameState);
      setMyHand(data.gameState.myHand || []);

      if (data.gameState.status === "finished") {
        return;
      }

      const currentPlayer = data.gameState.players[data.gameState.currentPlayerIndex];
      if (currentPlayer?.id === playerId && currentPlayer?.isAi) {
        setTimeout(fetchGameState, 1500);
      }
    } catch (error) {
      setPollFailures((prev) => prev + 1);
      toast.error("Failed to fetch game state");
    } finally {
      setLoading(false);
    }
  }, [roomCode, router, playerId, pollFailures]);

  useEffect(() => {
    fetchGameState();
    const interval = setInterval(fetchGameState, 2000);
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

      setGameState(data.gameState);
      setMyHand(data.gameState.myHand || []);
      setPendingWildCard(null);

      if (myHand.length === 2 && !hasSaidUno) {
        toast("Don't forget to say UNO!", { icon: "⚠️" });
      }
    } catch (error) {
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
        toast.error(data.error || "Failed to draw card");
        return;
      }

      if (soundEnabled) playSound("draw");

      setGameState(data.gameState);
      setMyHand(data.gameState.myHand || []);
      toast.success("Drew a card");
    } catch (error) {
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
      toast.success("UNO!");
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
      }
    } catch (error) {
      toast.error("Failed to start new game");
    }
  };

  if (loading || !gameState) {
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
        red: { bg: "#FF2B2B", glow: "var(--neon-glow-red)" },
        blue: { bg: "#1A8CFF", glow: "var(--neon-glow-blue)" },
        green: { bg: "#00CC66", glow: "var(--neon-glow-green)" },
        yellow: { bg: "#FFD700", glow: "var(--neon-glow-yellow)" },
      }[gameState.currentColor as "red" | "blue" | "green" | "yellow"]
    : null;

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 table-felt pointer-events-none" />

      <header className="relative z-20 flex items-center justify-between p-3 sm:p-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push("/")}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <TurnIndicator
          currentplayerName={currentPlayer?.displayName || "Unknown"}
          message={isMyTurn ? "Your turn!" : undefined}
        />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </Button>
      </header>

      <div className="flex-1 flex flex-col relative z-10">
        <div className="flex-1 flex items-start justify-center gap-2 sm:gap-4 p-2 sm:p-4 flex-wrap">
          {opponents.map((opponent) => (
            <OpponentHand
              key={opponent.id}
              cardCount={opponent.hand.length}
              displayName={opponent.displayName}
              isCurrentTurn={gameState.players[gameState.currentPlayerIndex]?.id === opponent.id}
              hasSaidUno={opponent.hasSaidUno}
            />
          ))}
        </div>

        <div className="flex-1 flex items-center justify-center gap-4 sm:gap-12 lg:gap-20 px-4 relative">
          <div className="flex flex-col items-center gap-3">
            <DrawPile
              count={gameState.drawPile.length}
              onDraw={handleDrawCard}
              canDraw={canDraw}
            />
          </div>

          <div className="flex flex-col items-center gap-3">
            <DiscardPile
              cards={gameState.discardPile}
              currentColor={gameState.currentColor}
            />
            
            {currentColorStyle && topCard?.color === "wild" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-2 flex items-center gap-2"
              >
                <span className="text-white/50 text-xs sm:text-sm">Current:</span>
                <motion.div
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white/50"
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
              </motion.div>
            )}
          </div>

          {gameState.currentColor && topCard?.color !== "wild" && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm"
            >
              <span className="text-white/50 text-xs">Active:</span>
              <motion.div
                className="w-5 h-5 rounded-full border-2 border-white/50"
                style={{ 
                  backgroundColor: currentColorStyle?.bg,
                  boxShadow: currentColorStyle?.glow,
                }}
              />
            </motion.div>
          )}
        </div>

        <div className="flex-1" />
      </div>

      <div className="relative z-10 p-3 sm:p-4 pb-4 sm:pb-6">
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${
              isMyTurn
                ? "bg-[var(--uno-yellow)] text-gray-900 shadow-lg"
                : "bg-white/10 text-white/70"
            }`}
          >
            {playerName} ({myHand.length} cards)
          </motion.span>

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
