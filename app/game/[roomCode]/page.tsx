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
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";

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

  const { playSound } = useSoundEffects();

  const playerId = typeof window !== "undefined" ? localStorage.getItem("playerId") : null;
  const playerName = typeof window !== "undefined" ? localStorage.getItem("playerName") : "Player";

  const fetchGameState = useCallback(async () => {
    if (!playerId) return;

    try {
      const response = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "get_state",
          roomCode,
          playerId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to fetch game");
        router.push("/");
        return;
      }

      if (data.game.status === "waiting") {
        router.push(`/lobby/${roomCode}`);
        return;
      }

      setGameState(data.game);
      setMyHand(data.myHand || []);

      if (data.game.status === "playing") {
        const currentPlayer = data.game.players[data.game.currentPlayerIndex];
        if (currentPlayer?.id === playerId && currentPlayer?.isAi) {
          setTimeout(fetchGameState, 1500);
        }
      }
    } catch (error) {
      toast.error("Failed to fetch game state");
    } finally {
      setLoading(false);
    }
  }, [roomCode, router, playerId]);

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
      <main className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full"
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

  const myPlayerData = gameState.players.find((p) => p.id === playerId);
  const opponents = gameState.players.filter((p) => p.id !== playerId);

  const shouldShowUnoButton = myHand.length <= 2 && !hasSaidUno;
  const canDraw = isMyTurn && getPlayableCards(myHand, topCard, gameState.currentColor).length === 0;

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <header className="flex items-center justify-between p-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <TurnIndicator
          currentplayerName={currentPlayer?.displayName || "Unknown"}
          message={
            isMyTurn
              ? "Your turn!"
              : undefined
          }
        />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSoundEnabled(!soundEnabled)}
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </Button>
      </header>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-start justify-center gap-4 p-4 flex-wrap">
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

        <div className="flex-1 flex items-center justify-center gap-8 sm:gap-16 px-4">
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

        <div className="flex-1" />
      </div>

      <div className="p-4 pb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isMyTurn
                ? "bg-yellow-500 text-gray-900"
                : "bg-white/10 text-white/70"
            }`}
          >
            {playerName} ({myHand.length} cards)
          </span>

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
