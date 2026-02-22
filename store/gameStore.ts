import { create } from "zustand";
import { Card, CardColor, GameState, Player } from "@/lib/game-engine";

export interface GameStore {
  gameState: GameState | null;
  currentPlayerId: string | null;
  roomCode: string | null;
  pendingWildCard: Card | null;
  
  setGameState: (state: GameState) => void;
  setCurrentPlayerId: (id: string) => void;
  setRoomCode: (code: string) => void;
  setPendingWildCard: (card: Card | null) => void;
  
  playCard: (playerId: string, cardId: string, chosenColor?: CardColor) => void;
  drawCard: (playerId: string) => void;
  sayUno: (playerId: string) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: null,
  currentPlayerId: null,
  roomCode: null,
  pendingWildCard: null,
  
  setGameState: (state) => set({ gameState: state }),
  setCurrentPlayerId: (id) => set({ currentPlayerId: id }),
  setRoomCode: (code) => set({ roomCode: code }),
  setPendingWildCard: (card) => set({ pendingWildCard: card }),
  
  playCard: (playerId, cardId, chosenColor) => {
    set((state) => {
      if (!state.gameState) return state;
      return { gameState: { ...state.gameState } };
    });
  },
  
  drawCard: (playerId) => {
    set((state) => {
      if (!state.gameState) return state;
      return { gameState: { ...state.gameState } };
    });
  },
  
  sayUno: (playerId) => {
    set((state) => {
      if (!state.gameState) return state;
      return { gameState: { ...state.gameState } };
    });
  },
  
  reset: () => set({
    gameState: null,
    currentPlayerId: null,
    roomCode: null,
    pendingWildCard: null,
  }),
}));
