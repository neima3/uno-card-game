"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export interface UseGameSocketOptions {
  roomCode: string;
  playerId: string;
  onGameStateUpdate?: (state: any) => void;
}

export function useGameSocket({ roomCode, playerId, onGameStateUpdate }: UseGameSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(false);

  const emit = useCallback(async (event: string, data: any) => {
    try {
      const response = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, roomCode, playerId, ...data }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || "Action failed");
        return false;
      }
      
      const result = await response.json();
      if (result.gameState && onGameStateUpdate) {
        onGameStateUpdate(result.gameState);
      }
      return true;
    } catch (error) {
      toast.error("Connection error");
      return false;
    }
  }, [roomCode, playerId, onGameStateUpdate]);

  const playCard = useCallback(async (cardId: string, chosenColor?: string) => {
    return emit("play_card", { cardId, chosenColor });
  }, [emit]);

  const drawCard = useCallback(async () => {
    return emit("draw_card", {});
  }, [emit]);

  const sayUno = useCallback(async () => {
    return emit("say_uno", {});
  }, [emit]);

  const callUnoPenalty = useCallback(async (targetPlayerId: string) => {
    return emit("call_uno_penalty", { targetPlayerId });
  }, [emit]);

  const startGame = useCallback(async () => {
    return emit("start_game", {});
  }, [emit]);

  return {
    isConnected,
    isMyTurn,
    playCard,
    drawCard,
    sayUno,
    callUnoPenalty,
    startGame,
    emit,
  };
}
