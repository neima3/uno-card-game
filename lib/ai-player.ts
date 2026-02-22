import { Card, CardColor, GameState, Player, getPlayableCards, canPlayCard } from "./game-engine";

export type AIDifficulty = "easy" | "medium" | "hard";

export function getAIPlay(
  gameState: GameState,
  playerId: string
): { cardId: string; chosenColor?: CardColor } | null {
  const player = gameState.players.find((p) => p.id === playerId);
  if (!player || !player.isAi) return null;
  
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];
  const playableCards = getPlayableCards(player.hand, topCard, gameState.currentColor);
  
  if (playableCards.length === 0) return null;
  
  const difficulty = player.aiDifficulty || "medium";
  
  switch (difficulty) {
    case "easy":
      return getEasyAIPlay(playableCards, player);
    case "medium":
      return getMediumAIPlay(playableCards, player, gameState);
    case "hard":
      return getHardAIPlay(playableCards, player, gameState);
    default:
      return getMediumAIPlay(playableCards, player, gameState);
  }
}

function getEasyAIPlay(playableCards: Card[], player: Player): { cardId: string; chosenColor?: CardColor } {
  const card = playableCards[Math.floor(Math.random() * playableCards.length)];
  let chosenColor: CardColor | undefined;
  
  if (card.color === "wild") {
    const colors: CardColor[] = ["red", "blue", "green", "yellow"];
    chosenColor = colors[Math.floor(Math.random() * colors.length)];
  }
  
  return { cardId: card.id, chosenColor };
}

function getMediumAIPlay(playableCards: Card[], player: Player, gameState: GameState): { cardId: string; chosenColor?: CardColor } {
  const nonWildCards = playableCards.filter((c) => c.color !== "wild");
  
  if (nonWildCards.length > 0 && Math.random() > 0.3) {
    const actionCards = nonWildCards.filter((c) => ["skip", "reverse", "draw2"].includes(c.value));
    
    if (actionCards.length > 0 && Math.random() > 0.5) {
      const card = actionCards[Math.floor(Math.random() * actionCards.length)];
      return { cardId: card.id };
    }
    
    const card = nonWildCards[Math.floor(Math.random() * nonWildCards.length)];
    return { cardId: card.id };
  }
  
  const card = playableCards[Math.floor(Math.random() * playableCards.length)];
  let chosenColor: CardColor | undefined;
  
  if (card.color === "wild") {
    chosenColor = getMostCommonColor(player.hand);
  }
  
  return { cardId: card.id, chosenColor };
}

function getHardAIPlay(playableCards: Card[], player: Player, gameState: GameState): { cardId: string; chosenColor?: CardColor } {
  const nextPlayerIndex = (gameState.currentPlayerIndex + gameState.direction + gameState.players.length) % gameState.players.length;
  const nextPlayer = gameState.players[nextPlayerIndex];
  
  const nonWildCards = playableCards.filter((c) => c.color !== "wild");
  
  if (nextPlayer && nextPlayer.hand.length <= 2) {
    const drawCards = playableCards.filter((c) => c.value === "draw2" || c.value === "wild4");
    if (drawCards.length > 0) {
      const card = drawCards[0];
      let chosenColor: CardColor | undefined;
      if (card.color === "wild") {
        chosenColor = getMostCommonColor(player.hand);
      }
      return { cardId: card.id, chosenColor };
    }
    
    const skipCards = playableCards.filter((c) => c.value === "skip");
    if (skipCards.length > 0) {
      return { cardId: skipCards[0].id };
    }
  }
  
  const colorCounts: Record<string, number> = {};
  for (const card of player.hand) {
    if (card.color !== "wild") {
      colorCounts[card.color] = (colorCounts[card.color] || 0) + 1;
    }
  }
  
  const maxColor = Object.entries(colorCounts).sort((a, b) => b[1] - a[1])[0];
  
  if (maxColor) {
    const colorCards = nonWildCards.filter((c) => c.color === maxColor[0]);
    if (colorCards.length > 0) {
      const actionCards = colorCards.filter((c) => ["skip", "reverse", "draw2"].includes(c.value));
      if (actionCards.length > 0) {
        return { cardId: actionCards[0].id };
      }
      return { cardId: colorCards[0].id };
    }
  }
  
  if (nonWildCards.length > 0) {
    return { cardId: nonWildCards[0].id };
  }
  
  const card = playableCards[0];
  let chosenColor: CardColor | undefined;
  if (card.color === "wild") {
    chosenColor = getMostCommonColor(player.hand);
  }
  
  return { cardId: card.id, chosenColor };
}

function getMostCommonColor(hand: Card[]): CardColor {
  const colorCounts: Record<string, number> = {
    red: 0,
    blue: 0,
    green: 0,
    yellow: 0,
  };
  
  for (const card of hand) {
    if (card.color !== "wild" && colorCounts[card.color] !== undefined) {
      colorCounts[card.color]++;
    }
  }
  
  const maxEntry = Object.entries(colorCounts).sort((a, b) => b[1] - a[1])[0];
  return maxEntry[0] as CardColor;
}

export function getAIDelay(difficulty: AIDifficulty): number {
  switch (difficulty) {
    case "easy":
      return 500 + Math.random() * 500;
    case "medium":
      return 800 + Math.random() * 700;
    case "hard":
      return 1000 + Math.random() * 1000;
    default:
      return 800;
  }
}

export function shouldAISayUno(player: Player): boolean {
  if (player.hand.length === 2 && !player.isAi) return false;
  return player.hand.length === 2;
}
