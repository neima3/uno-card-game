import { Card, CardColor, GameState, Player, getPlayableCards, canPlayCard } from "./game-engine";

export type AIDifficulty = "easy" | "medium" | "hard";

export function getAIPlay(
  gameState: GameState,
  playerId: string
): { cardId: string; chosenColor?: CardColor } | null {
  const player = gameState.players.find((p) => p.id === playerId);
  if (!player || !player.isAi) return null;

  const topCard = gameState.discardPile[gameState.discardPile.length - 1];
  if (!topCard) return null;

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

function getEasyAIPlay(
  playableCards: Card[],
  player: Player
): { cardId: string; chosenColor?: CardColor } {
  const card = playableCards[Math.floor(Math.random() * playableCards.length)];
  let chosenColor: CardColor | undefined;

  if (card.color === "wild") {
    const colors: CardColor[] = ["red", "blue", "green", "yellow"];
    chosenColor = colors[Math.floor(Math.random() * colors.length)];
  }

  return { cardId: card.id, chosenColor };
}

function getMediumAIPlay(
  playableCards: Card[],
  player: Player,
  gameState: GameState
): { cardId: string; chosenColor?: CardColor } {
  const nonWildCards = playableCards.filter((c) => c.color !== "wild");

  // Prefer action cards to disrupt opponents
  if (nonWildCards.length > 0) {
    const actionCards = nonWildCards.filter((c) =>
      ["skip", "reverse", "draw2"].includes(c.value)
    );

    // Play action cards 60% of the time if available
    if (actionCards.length > 0 && Math.random() > 0.4) {
      const card = actionCards[Math.floor(Math.random() * actionCards.length)];
      return { cardId: card.id };
    }

    // Play highest value number card to get rid of points
    const numberCards = nonWildCards
      .filter((c) => !["skip", "reverse", "draw2"].includes(c.value))
      .sort((a, b) => parseInt(b.value) - parseInt(a.value));

    if (numberCards.length > 0) {
      return { cardId: numberCards[0].id };
    }

    return { cardId: nonWildCards[0].id };
  }

  // Only wild cards left
  const card = playableCards[0];
  return { cardId: card.id, chosenColor: getMostCommonColor(player.hand) };
}

function getHardAIPlay(
  playableCards: Card[],
  player: Player,
  gameState: GameState
): { cardId: string; chosenColor?: CardColor } {
  const nextPlayerIndex =
    (gameState.currentPlayerIndex + gameState.direction + gameState.players.length) %
    gameState.players.length;
  const nextPlayer = gameState.players[nextPlayerIndex];

  const nonWildCards = playableCards.filter((c) => c.color !== "wild");
  const wildCards = playableCards.filter((c) => c.color === "wild");

  // Priority 1: If next player has few cards, attack with draw/skip cards
  if (nextPlayer && nextPlayer.hand.length <= 2) {
    const draw4 = wildCards.find((c) => c.value === "wild4");
    if (draw4) {
      return { cardId: draw4.id, chosenColor: getMostCommonColor(player.hand) };
    }
    const draw2 = nonWildCards.find((c) => c.value === "draw2");
    if (draw2) {
      return { cardId: draw2.id };
    }
    const skip = nonWildCards.find((c) => c.value === "skip");
    if (skip) {
      return { cardId: skip.id };
    }
    const reverse = nonWildCards.find((c) => c.value === "reverse");
    if (reverse && gameState.players.length === 2) {
      return { cardId: reverse.id };
    }
  }

  // Priority 2: If we have 2 cards, save wild cards as last resort
  if (player.hand.length === 2 && nonWildCards.length > 0) {
    return { cardId: nonWildCards[0].id };
  }

  // Priority 3: Play cards matching our most common color to maintain control
  const colorCounts = getColorCounts(player.hand);
  const sortedColors = Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([color]) => color);

  for (const color of sortedColors) {
    const colorCards = nonWildCards.filter((c) => c.color === color);
    if (colorCards.length > 0) {
      // Prefer action cards in our best color
      const actionCards = colorCards.filter((c) =>
        ["skip", "reverse", "draw2"].includes(c.value)
      );
      if (actionCards.length > 0) {
        return { cardId: actionCards[0].id };
      }
      // Play highest value number card
      const sorted = colorCards.sort(
        (a, b) => parseInt(b.value || "0") - parseInt(a.value || "0")
      );
      return { cardId: sorted[0].id };
    }
  }

  // Priority 4: Play any non-wild card
  if (nonWildCards.length > 0) {
    return { cardId: nonWildCards[0].id };
  }

  // Priority 5: Play wild card (prefer regular wild over wild4)
  const regularWild = wildCards.find((c) => c.value === "wild");
  const card = regularWild || wildCards[0];
  return { cardId: card.id, chosenColor: getMostCommonColor(player.hand) };
}

function getColorCounts(hand: Card[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const card of hand) {
    if (card.color !== "wild") {
      counts[card.color] = (counts[card.color] || 0) + 1;
    }
  }
  return counts;
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
  return player.isAi && player.hand.length === 2;
}
