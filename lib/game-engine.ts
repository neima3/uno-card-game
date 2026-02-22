import { shuffle } from "./utils";

export type CardColor = "red" | "blue" | "green" | "yellow" | "wild";
export type CardValue = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "skip" | "reverse" | "draw2" | "wild" | "wild4";

export interface Card {
  id: string;
  color: CardColor;
  value: CardValue;
}

export interface Player {
  id: string;
  displayName: string;
  hand: Card[];
  seatOrder: number;
  isActive: boolean;
  isAi: boolean;
  aiDifficulty?: "easy" | "medium" | "hard";
  hasSaidUno: boolean;
  score: number;
}

export interface GameState {
  id: string;
  roomCode: string;
  status: "waiting" | "playing" | "finished";
  players: Player[];
  currentPlayerIndex: number;
  direction: 1 | -1;
  drawPile: Card[];
  discardPile: Card[];
  currentColor: CardColor | null;
  winnerId: string | null;
}

let cardIdCounter = 0;

export function createCard(color: CardColor, value: CardValue): Card {
  return {
    id: `card-${++cardIdCounter}`,
    color,
    value,
  };
}

export function createDeck(): Card[] {
  const deck: Card[] = [];
  const colors: CardColor[] = ["red", "blue", "green", "yellow"];
  
  for (const color of colors) {
    deck.push(createCard(color, "0"));
    for (let i = 1; i <= 9; i++) {
      deck.push(createCard(color, i.toString() as CardValue));
      deck.push(createCard(color, i.toString() as CardValue));
    }
    for (let i = 0; i < 2; i++) {
      deck.push(createCard(color, "skip"));
      deck.push(createCard(color, "reverse"));
      deck.push(createCard(color, "draw2"));
    }
  }
  
  for (let i = 0; i < 4; i++) {
    deck.push(createCard("wild", "wild"));
    deck.push(createCard("wild", "wild4"));
  }
  
  return shuffle(deck);
}

export function dealCards(deck: Card[], players: Player[], cardsPerPlayer: number = 7): { deck: Card[]; players: Player[] } {
  const newDeck = [...deck];
  const newPlayers = players.map((player) => ({
    ...player,
    hand: [] as Card[],
  }));
  
  for (let i = 0; i < cardsPerPlayer; i++) {
    for (const player of newPlayers) {
      if (newDeck.length > 0) {
        player.hand.push(newDeck.pop()!);
      }
    }
  }
  
  return { deck: newDeck, players: newPlayers };
}

export function canPlayCard(card: Card, topCard: Card, currentColor: CardColor | null): boolean {
  if (card.color === "wild") return true;
  if (currentColor && card.color === currentColor) return true;
  if (card.color === topCard.color) return true;
  if (card.value === topCard.value) return true;
  return false;
}

export function getPlayableCards(hand: Card[], topCard: Card, currentColor: CardColor | null): Card[] {
  return hand.filter((card) => canPlayCard(card, topCard, currentColor));
}

export function playCard(
  state: GameState,
  playerId: string,
  cardId: string,
  chosenColor?: CardColor
): GameState | null {
  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) return null;
  if (state.currentPlayerIndex !== playerIndex) return null;
  
  const player = state.players[playerIndex];
  const cardIndex = player.hand.findIndex((c) => c.id === cardId);
  if (cardIndex === -1) return null;
  
  const card = player.hand[cardIndex];
  const topCard = state.discardPile[state.discardPile.length - 1];
  
  if (!canPlayCard(card, topCard, state.currentColor)) return null;
  
  let newState = { ...state };
  const newPlayers = [...state.players];
  const newPlayer = { ...player, hand: [...player.hand] };
  newPlayer.hand.splice(cardIndex, 1);
  newPlayers[playerIndex] = newPlayer;
  newState.players = newPlayers;
  
  const newDiscardPile = [...state.discardPile, card];
  newState.discardPile = newDiscardPile;
  
  if (card.color === "wild" && chosenColor) {
    newState.currentColor = chosenColor;
  } else if (card.color !== "wild") {
    newState.currentColor = card.color;
  }
  
  if (card.value === "reverse") {
    newState.direction = state.direction === 1 ? -1 : 1;
  }
  
  let nextPlayerIndex = playerIndex;
  
  if (card.value === "skip") {
    nextPlayerIndex = getNextPlayerIndex(newState, nextPlayerIndex);
    nextPlayerIndex = getNextPlayerIndex(newState, nextPlayerIndex);
  } else if (card.value === "draw2") {
    nextPlayerIndex = getNextPlayerIndex(newState, playerIndex);
    const targetPlayer = { ...newPlayers[nextPlayerIndex] };
    const drawnCards = newState.drawPile.splice(-2);
    targetPlayer.hand = [...targetPlayer.hand, ...drawnCards];
    newPlayers[nextPlayerIndex] = targetPlayer;
    nextPlayerIndex = getNextPlayerIndex(newState, nextPlayerIndex);
  } else if (card.value === "wild4") {
    nextPlayerIndex = getNextPlayerIndex(newState, playerIndex);
    const targetPlayer = { ...newPlayers[nextPlayerIndex] };
    const drawnCards = newState.drawPile.splice(-4);
    targetPlayer.hand = [...targetPlayer.hand, ...drawnCards];
    newPlayers[nextPlayerIndex] = targetPlayer;
    nextPlayerIndex = getNextPlayerIndex(newState, nextPlayerIndex);
  } else {
    nextPlayerIndex = getNextPlayerIndex(newState, playerIndex);
  }
  
  newState.currentPlayerIndex = nextPlayerIndex;
  
  if (newPlayer.hand.length === 0) {
    newState.status = "finished";
    newState.winnerId = playerId;
  }
  
  return newState;
}

function getNextPlayerIndex(state: GameState, currentIndex: number): number {
  const numPlayers = state.players.length;
  return (currentIndex + state.direction + numPlayers) % numPlayers;
}

export function drawCard(state: GameState, playerId: string): GameState | null {
  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) return null;
  if (state.currentPlayerIndex !== playerIndex) return null;
  if (state.drawPile.length === 0) return null;
  
  const newState = { ...state };
  const newPlayers = [...state.players];
  const newPlayer = { ...newPlayers[playerIndex], hand: [...newPlayers[playerIndex].hand] };
  const card = newState.drawPile.pop()!;
  newPlayer.hand.push(card);
  newPlayers[playerIndex] = newPlayer;
  newState.players = newPlayers;
  
  const topCard = newState.discardPile[newState.discardPile.length - 1];
  if (!canPlayCard(card, topCard, newState.currentColor)) {
    newState.currentPlayerIndex = getNextPlayerIndex(newState, playerIndex);
  }
  
  return newState;
}

export function reshuffleDeckIfNeeded(state: GameState): GameState {
  if (state.drawPile.length > 0) return state;
  
  if (state.discardPile.length <= 1) return state;
  
  const newState = { ...state };
  const topCard = newState.discardPile.pop()!;
  newState.drawPile = shuffle(newState.discardPile);
  newState.discardPile = [topCard];
  
  return newState;
}

export function sayUno(state: GameState, playerId: string): GameState {
  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) return state;
  
  const newPlayers = [...state.players];
  newPlayers[playerIndex] = { ...newPlayers[playerIndex], hasSaidUno: true };
  
  return { ...state, players: newPlayers };
}

export function callUnoPenalty(state: GameState, targetPlayerId: string): GameState | null {
  const playerIndex = state.players.findIndex((p) => p.id === targetPlayerId);
  if (playerIndex === -1) return null;
  
  const player = state.players[playerIndex];
  if (player.hand.length !== 1 || player.hasSaidUno) return null;
  
  const newState = { ...state };
  const newPlayers = [...state.players];
  const newPlayer = { ...player, hand: [...player.hand] };
  
  const drawnCards = newState.drawPile.splice(-2);
  newPlayer.hand.push(...drawnCards);
  newPlayers[playerIndex] = newPlayer;
  newState.players = newPlayers;
  
  return newState;
}

export function calculateScore(players: Player[], winnerId: string): number {
  let score = 0;
  
  for (const player of players) {
    if (player.id === winnerId) continue;
    
    for (const card of player.hand) {
      if (card.value === "wild" || card.value === "wild4") {
        score += 50;
      } else if (card.value === "skip" || card.value === "reverse" || card.value === "draw2") {
        score += 20;
      } else {
        score += parseInt(card.value);
      }
    }
  }
  
  return score;
}

export function initializeGame(roomCode: string, playerData: Array<{ id: string; displayName: string; isAi?: boolean; aiDifficulty?: "easy" | "medium" | "hard" }>): GameState {
  let deck = createDeck();
  
  const players: Player[] = playerData.map((p, index) => ({
    id: p.id,
    displayName: p.displayName,
    hand: [],
    seatOrder: index,
    isActive: true,
    isAi: p.isAi || false,
    aiDifficulty: p.aiDifficulty,
    hasSaidUno: false,
    score: 0,
  }));
  
  const result = dealCards(deck, players);
  deck = result.deck;
  
  let startCard: Card;
  do {
    startCard = deck.pop()!;
    if (startCard.color === "wild") {
      deck.unshift(startCard);
    }
  } while (startCard.color === "wild");
  
  return {
    id: "",
    roomCode,
    status: "playing",
    players: result.players,
    currentPlayerIndex: 0,
    direction: 1,
    drawPile: deck,
    discardPile: [startCard],
    currentColor: startCard.color,
    winnerId: null,
  };
}

export function shouldCallUnoPenalty(player: Player, gameState: GameState): boolean {
  return player.hand.length === 1 && !player.hasSaidUno && gameState.status === "playing";
}
