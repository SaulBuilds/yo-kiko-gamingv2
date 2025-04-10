import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().unique(),
  username: text("username"),
  avatar: text("avatar_url"),
  score: integer("score").default(0),
  xp: integer("xp").default(0),
  gamesPlayed: integer("games_played").default(0),
  gamesWon: integer("games_won").default(0),
  lastDailyReward: timestamp("last_daily_reward")
});

export const gameMatches = pgTable("game_matches", {
  id: serial("id").primaryKey(),
  player1Id: integer("player1_id").notNull(),
  player2Id: integer("player2_id"),
  betAmount: text("bet_amount").notNull(),
  betType: text("bet_type").notNull().default("xp"), // 'xp' or 'crypto'
  cryptoType: text("crypto_type"), // 'eth' or 'icp' when betType is 'crypto'
  status: text("status").notNull(), // 'waiting', 'in_progress', 'completed'
  winnerId: integer("winner_id"),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  gameType: text("game_type").notNull().default("tetris"),
  isPractice: boolean("is_practice").default(false),
  timeLimit: integer("time_limit"), // in minutes
  player1Score: integer("player1_score"),
  player2Score: integer("player2_score"),
  expiresAt: timestamp("expires_at")
});

// New creator applications table
export const creatorApplications = pgTable("creator_applications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  walletAddress: text("wallet_address").notNull(),
  experienceLevel: text("experience_level").notNull(), // 'beginner', 'intermediate', 'advanced'
  gameDevBackground: text("game_dev_background").notNull(),
  projectProposal: text("project_proposal").notNull(),
  portfolioLinks: text("portfolio_links"),
  preferredTechnologies: text("preferred_technologies"),
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'rejected'
  submittedAt: timestamp("submitted_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  userId: integer("user_id").references(() => users.id),
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
  betType: true,
  cryptoType: true,
  gameType: true,
  isPractice: true,
  timeLimit: true
}).partial({
  isPractice: true,
  timeLimit: true,
  betType: true,
  cryptoType: true
});

// Create schema for creator applications
export const insertCreatorApplicationSchema = createInsertSchema(creatorApplications).pick({
  name: true,
  email: true,
  walletAddress: true,
  experienceLevel: true,
  gameDevBackground: true,
  projectProposal: true,
  portfolioLinks: true,
  preferredTechnologies: true,
}).extend({
  email: z.string().email("Invalid email address"),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GameMatch = typeof gameMatches.$inferSelect;
export type InsertGameMatch = z.infer<typeof insertGameMatchSchema>;
export type CreatorApplication = typeof creatorApplications.$inferSelect;
export type InsertCreatorApplication = z.infer<typeof insertCreatorApplicationSchema>;