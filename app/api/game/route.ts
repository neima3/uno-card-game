import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { games, players, gameEvents } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { generateRoomCode } from "@/lib/utils";
import {
  initializeGame,
  playCard as gamePlayCard,
  drawCard as gameDrawCard,
  sayUno as gameSayUno,
  callUnoPenalty,
  reshuffleDeckIfNeeded,
  CardColor,
} from "@/lib/game-engine";
import { getAIPlay } from "@/lib/ai-player";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, roomCode, playerId, ...data } = body;

    switch (event) {
      case "create_room": {
        const { displayName, vsComputer, aiCount, aiDifficulty } = body;
        const code = generateRoomCode();
        const gameId = uuidv4();
        const newPlayerId = uuidv4();

        await db.insert(games).values({
          id: gameId,
          roomCode: code,
          status: "waiting",
          drawPile: [],
          discardPile: [],
        });

        await db.insert(players).values({
          id: newPlayerId,
          gameId,
          displayName,
          hand: [],
          seatOrder: 0,
          isActive: true,
          isAi: false,
        });

        if (vsComputer && aiCount > 0) {
          for (let i = 0; i < aiCount; i++) {
            const aiId = uuidv4();
            await db.insert(players).values({
              id: aiId,
              gameId,
              displayName: `AI ${i + 1}`,
              hand: [],
              seatOrder: i + 1,
              isActive: true,
              isAi: true,
              aiDifficulty,
            });
          }

          // Auto-start the game for vs computer mode
          const allPlayers = await db
            .select()
            .from(players)
            .where(eq(players.gameId, gameId));

          const playerData = allPlayers.map((p) => ({
            id: p.id,
            displayName: p.displayName,
            isAi: p.isAi || false,
            aiDifficulty: p.aiDifficulty as "easy" | "medium" | "hard" | undefined,
          }));

          const gameState = initializeGame(code, playerData);

          // Update players with their dealt hands
          for (const p of gameState.players) {
            await db
              .update(players)
              .set({ hand: p.hand })
              .where(eq(players.id, p.id));
          }

          // Update game with initialized state
          await db
            .update(games)
            .set({
              status: "playing",
              drawPile: gameState.drawPile,
              discardPile: gameState.discardPile,
              currentColor: gameState.currentColor,
              currentPlayerIndex: 0,
              direction: 1,
              updatedAt: new Date(),
            })
            .where(eq(games.id, gameId));
        }

        return NextResponse.json({ roomCode: code, playerId: newPlayerId, gameId });
      }

      case "join_room": {
        const { roomCode: code, displayName } = body;
        
        const [game] = await db
          .select()
          .from(games)
          .where(eq(games.roomCode, code));

        if (!game) {
          return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        if (game.status !== "waiting") {
          return NextResponse.json({ error: "Game already started" }, { status: 400 });
        }

        const existingPlayers = await db
          .select()
          .from(players)
          .where(eq(players.gameId, game.id));

        if (existingPlayers.length >= 6) {
          return NextResponse.json({ error: "Room is full" }, { status: 400 });
        }

        const newPlayerId = uuidv4();
        await db.insert(players).values({
          id: newPlayerId,
          gameId: game.id,
          displayName,
          hand: [],
          seatOrder: existingPlayers.length,
          isActive: true,
          isAi: false,
        });

        return NextResponse.json({ playerId: newPlayerId, gameId: game.id });
      }

      case "get_state": {
        const { roomCode: code } = body;
        
        const [game] = await db
          .select()
          .from(games)
          .where(eq(games.roomCode, code));

        if (!game) {
          return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        const gamePlayers = await db
          .select()
          .from(players)
          .where(eq(players.gameId, game.id));

        return NextResponse.json({
          game: {
            ...game,
            players: gamePlayers,
          },
        });
      }

      case "start_game": {
        const { roomCode: code, playerId: pid } = body;
        
        const [game] = await db
          .select()
          .from(games)
          .where(eq(games.roomCode, code));

        if (!game) {
          return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        const gamePlayers = await db
          .select()
          .from(players)
          .where(eq(players.gameId, game.id));

        if (gamePlayers.length < 2) {
          return NextResponse.json({ error: "Need at least 2 players" }, { status: 400 });
        }

        const playerData = gamePlayers.map((p) => ({
          id: p.id,
          displayName: p.displayName,
          isAi: p.isAi || false,
          aiDifficulty: p.aiDifficulty as "easy" | "medium" | "hard" | undefined,
        }));

        const gameState = initializeGame(code, playerData);

        await db
          .update(games)
          .set({
            status: "playing",
            drawPile: gameState.drawPile,
            discardPile: gameState.discardPile,
            currentColor: gameState.currentColor,
            currentPlayerIndex: 0,
            direction: 1,
            updatedAt: new Date(),
          })
          .where(eq(games.id, game.id));

        for (const player of gameState.players) {
          await db
            .update(players)
            .set({ hand: player.hand })
            .where(eq(players.id, player.id));
        }

        await db.insert(gameEvents).values({
          gameId: game.id,
          eventType: "game_start",
          eventData: { playerCount: gamePlayers.length },
        });

        const responseState = await getGameState(game.id, pid);
        return NextResponse.json({ gameState: responseState });
      }

      case "play_card": {
        const { cardId, chosenColor } = body;
        
        const [game] = await db
          .select()
          .from(games)
          .where(eq(games.roomCode, roomCode));

        if (!game) {
          return NextResponse.json({ error: "Game not found" }, { status: 404 });
        }

        const gamePlayers = await db
          .select()
          .from(players)
          .where(eq(players.gameId, game.id));

        const gameState = await buildGameState(game, gamePlayers);
        
        const newGameState = gamePlayCard(
          gameState,
          playerId,
          cardId,
          chosenColor as CardColor
        );

        if (!newGameState) {
          return NextResponse.json({ error: "Invalid move" }, { status: 400 });
        }

        let currentState = reshuffleDeckIfNeeded(newGameState);
        let maxAiTurns = 20;

        while (currentState.status !== "finished" && maxAiTurns-- > 0) {
          const nextPlayer = currentState.players[currentState.currentPlayerIndex];
          if (!nextPlayer?.isAi) break;

          const aiMove = getAIPlay(currentState, nextPlayer.id);

          if (aiMove) {
            const nextState = gamePlayCard(
              currentState,
              nextPlayer.id,
              aiMove.cardId,
              aiMove.chosenColor
            );
            if (nextState) {
              currentState = reshuffleDeckIfNeeded(nextState);
            } else {
              let drawState = currentState.drawPile.length === 0 ? reshuffleDeckIfNeeded(currentState) : currentState;
              const drawnState = gameDrawCard(drawState, nextPlayer.id);
              if (drawnState) {
                currentState = reshuffleDeckIfNeeded(drawnState);
              } else {
                break;
              }
            }
          } else {
            let drawState = currentState.drawPile.length === 0 ? reshuffleDeckIfNeeded(currentState) : currentState;
            const drawnState = gameDrawCard(drawState, nextPlayer.id);
            if (drawnState) {
              currentState = reshuffleDeckIfNeeded(drawnState);
            } else {
              break;
            }
          }
        }

        await db
          .update(games)
          .set({
            status: currentState.status,
            drawPile: currentState.drawPile,
            discardPile: currentState.discardPile,
            currentColor: currentState.currentColor,
            currentPlayerIndex: currentState.currentPlayerIndex,
            direction: currentState.direction,
            winnerId: currentState.winnerId,
            updatedAt: new Date(),
          })
          .where(eq(games.id, game.id));

        for (const player of currentState.players) {
          await db
            .update(players)
            .set({
              hand: player.hand,
              hasSaidUno: player.hasSaidUno,
              score: player.score,
            })
            .where(eq(players.id, player.id));
        }

        await db.insert(gameEvents).values({
          gameId: game.id,
          playerId,
          eventType: "play_card",
          eventData: { cardId, chosenColor },
        });

        const responseState = await getGameState(game.id, playerId);
        return NextResponse.json({ gameState: responseState });
      }

      case "draw_card": {
        const [game] = await db
          .select()
          .from(games)
          .where(eq(games.roomCode, roomCode));

        if (!game) {
          return NextResponse.json({ error: "Game not found" }, { status: 404 });
        }

        const gamePlayers = await db
          .select()
          .from(players)
          .where(eq(players.gameId, game.id));

        let gameState = await buildGameState(game, gamePlayers);
        
        if (gameState.drawPile.length === 0) {
          gameState = reshuffleDeckIfNeeded(gameState);
        }

        const newGameState = gameDrawCard(gameState, playerId);

        if (!newGameState) {
          return NextResponse.json({ error: "Cannot draw" }, { status: 400 });
        }

        let currentState = reshuffleDeckIfNeeded(newGameState);
        let maxAiTurns = 20;

        while (currentState.status !== "finished" && maxAiTurns-- > 0) {
          const nextPlayer = currentState.players[currentState.currentPlayerIndex];
          if (!nextPlayer?.isAi) break;

          const aiMove = getAIPlay(currentState, nextPlayer.id);

          if (aiMove) {
            const nextState = gamePlayCard(
              currentState,
              nextPlayer.id,
              aiMove.cardId,
              aiMove.chosenColor
            );
            if (nextState) {
              currentState = reshuffleDeckIfNeeded(nextState);
            } else {
              let drawState = currentState.drawPile.length === 0 ? reshuffleDeckIfNeeded(currentState) : currentState;
              const drawnState = gameDrawCard(drawState, nextPlayer.id);
              if (drawnState) {
                currentState = reshuffleDeckIfNeeded(drawnState);
              } else {
                break;
              }
            }
          } else {
            let drawState = currentState.drawPile.length === 0 ? reshuffleDeckIfNeeded(currentState) : currentState;
            const drawnState = gameDrawCard(drawState, nextPlayer.id);
            if (drawnState) {
              currentState = reshuffleDeckIfNeeded(drawnState);
            } else {
              break;
            }
          }
        }

        await db
          .update(games)
          .set({
            status: currentState.status,
            drawPile: currentState.drawPile,
            discardPile: currentState.discardPile,
            currentColor: currentState.currentColor,
            currentPlayerIndex: currentState.currentPlayerIndex,
            direction: currentState.direction,
            winnerId: currentState.winnerId,
            updatedAt: new Date(),
          })
          .where(eq(games.id, game.id));

        for (const player of currentState.players) {
          await db
            .update(players)
            .set({
              hand: player.hand,
              hasSaidUno: player.hasSaidUno,
              score: player.score,
            })
            .where(eq(players.id, player.id));
        }

        await db.insert(gameEvents).values({
          gameId: game.id,
          playerId,
          eventType: "draw_card",
          eventData: {},
        });

        const responseState = await getGameState(game.id, playerId);
        return NextResponse.json({ gameState: responseState });
      }

      case "say_uno": {
        const [game] = await db
          .select()
          .from(games)
          .where(eq(games.roomCode, roomCode));

        if (!game) {
          return NextResponse.json({ error: "Game not found" }, { status: 404 });
        }

        const [player] = await db
          .select()
          .from(players)
          .where(eq(players.id, playerId));

        if (!player) {
          return NextResponse.json({ error: "Player not found" }, { status: 404 });
        }

        await db
          .update(players)
          .set({ hasSaidUno: true })
          .where(eq(players.id, playerId));

        await db.insert(gameEvents).values({
          gameId: game.id,
          playerId,
          eventType: "say_uno",
          eventData: {},
        });

        const responseState = await getGameState(game.id, playerId);
        return NextResponse.json({ gameState: responseState });
      }

      case "call_uno_penalty": {
        const { targetPlayerId } = body;
        
        const [game] = await db
          .select()
          .from(games)
          .where(eq(games.roomCode, roomCode));

        if (!game) {
          return NextResponse.json({ error: "Game not found" }, { status: 404 });
        }

        const gamePlayers = await db
          .select()
          .from(players)
          .where(eq(players.gameId, game.id));

        const gameState = await buildGameState(game, gamePlayers);
        
        const newGameState = callUnoPenalty(gameState, targetPlayerId);

        if (!newGameState) {
          return NextResponse.json({ error: "Cannot call penalty" }, { status: 400 });
        }

        for (const player of newGameState.players) {
          await db
            .update(players)
            .set({ hand: player.hand })
            .where(eq(players.id, player.id));
        }

        await db.insert(gameEvents).values({
          gameId: game.id,
          playerId,
          eventType: "call_uno_penalty",
          eventData: { targetPlayerId },
        });

        const responseState = await getGameState(game.id, playerId);
        return NextResponse.json({ gameState: responseState });
      }

      default:
        return NextResponse.json({ error: "Unknown event" }, { status: 400 });
    }
  } catch (error) {
    console.error("Game API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function buildGameState(game: any, gamePlayers: any[]): Promise<any> {
  return {
    id: game.id,
    roomCode: game.roomCode,
    status: game.status,
    players: gamePlayers.map((p: any) => ({
      id: p.id,
      displayName: p.displayName,
      hand: p.hand || [],
      seatOrder: p.seatOrder,
      isActive: p.isActive,
      isAi: p.isAi,
      aiDifficulty: p.aiDifficulty,
      hasSaidUno: p.hasSaidUno,
      score: p.score,
    })),
    currentPlayerIndex: game.currentPlayerIndex,
    direction: game.direction,
    drawPile: game.drawPile || [],
    discardPile: game.discardPile || [],
    currentColor: game.currentColor,
    winnerId: game.winnerId,
  };
}

async function getGameState(gameId: string, playerId: string) {
  const [game] = await db
    .select()
    .from(games)
    .where(eq(games.id, gameId));

  const gamePlayers = await db
    .select()
    .from(players)
    .where(eq(players.gameId, gameId));

  const state = await buildGameState(game, gamePlayers);

  return {
    ...state,
    players: state.players.map((p: any) => ({
      ...p,
      hand: p.id === playerId ? p.hand : p.hand.map(() => ({ id: "hidden", color: "wild", value: "0" as const })),
      handCount: p.hand.length,
    })),
    myHand: state.players.find((p: any) => p.id === playerId)?.hand || [],
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roomCode = searchParams.get("roomCode");
  const playerId = searchParams.get("playerId");

  if (!roomCode || !playerId) {
    return NextResponse.json({ error: "Missing roomCode or playerId" }, { status: 400 });
  }

  const [game] = await db
    .select()
    .from(games)
    .where(eq(games.roomCode, roomCode));

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const gameState = await getGameState(game.id, playerId);
  return NextResponse.json({ gameState });
}
