import { pgTable, uuid, varchar, integer, jsonb, boolean, timestamp } from "drizzle-orm/pg-core";

export const games = pgTable("uno_games", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomCode: varchar("room_code", { length: 6 }).notNull().unique(),
  status: varchar("status", { length: 20 }).notNull().default("waiting"),
  currentPlayerIndex: integer("current_player_index").notNull().default(0),
  direction: integer("direction").notNull().default(1),
  drawPile: jsonb("draw_pile").notNull().$type<any[]>().default([]),
  discardPile: jsonb("discard_pile").notNull().$type<any[]>().default([]),
  currentColor: varchar("current_color", { length: 10 }),
  winnerId: uuid("winner_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const players = pgTable("uno_players", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameId: uuid("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  displayName: varchar("display_name", { length: 50 }).notNull(),
  hand: jsonb("hand").notNull().$type<any[]>().default([]),
  seatOrder: integer("seat_order").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  isAi: boolean("is_ai").notNull().default(false),
  aiDifficulty: varchar("ai_difficulty", { length: 10 }),
  score: integer("score").notNull().default(0),
  hasSaidUno: boolean("has_said_uno").notNull().default(false),
  socketId: varchar("socket_id", { length: 100 }),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const gameEvents = pgTable("uno_game_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameId: uuid("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  playerId: uuid("player_id").references(() => players.id),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  eventData: jsonb("event_data").notNull().$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
export type GameEvent = typeof gameEvents.$inferSelect;
