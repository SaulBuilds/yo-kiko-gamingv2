import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().unique(),
  username: text("username"),
  avatar: text("avatar_url"),
  score: integer("score").default(0),
  gamesPlayed: integer("games_played").default(0),
  gamesWon: integer("games_won").default(0)
});

export const gameMatches = pgTable("game_matches", {
  id: serial("id").primaryKey(),
  player1Id: integer("player1_id").notNull(),
  player2Id: integer("player2_id"),
  betAmount: text("bet_amount").notNull(),
  status: text("status").notNull(), // 'waiting', 'in_progress', 'completed'
  winnerId: integer("winner_id"),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  gameType: text("game_type").notNull().default("tetris")
});

export const insertUserSchema = createInsertSchema(users).pick({
  walletAddress: true,
  username: true,
  avatar: true
}).partial({
  username: true,
  avatar: true
});

export const insertGameMatchSchema = createInsertSchema(gameMatches).pick({
  player1Id: true,
  betAmount: true,
  gameType: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GameMatch = typeof gameMatches.$inferSelect;
export type InsertGameMatch = z.infer<typeof insertGameMatchSchema>;