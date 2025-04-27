import { users, gameMatches, type User, type GameMatch, type InsertUser, type InsertGameMatch } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserScore(userId: number, score: number): Promise<void>;
  updateUserXP(userId: number, xp: number, updateScore: boolean): Promise<void>;
  getLeaderboard(): Promise<User[]>;
  
  // Game match methods
  createGameMatch(match: InsertGameMatch): Promise<GameMatch>;
  getGameMatch(id: number): Promise<GameMatch | undefined>;
  updateGameMatch(id: number, updates: Partial<GameMatch>): Promise<GameMatch>;
  getActiveMatches(): Promise<GameMatch[]>;
  
  // Creator application methods
  createCreatorApplication(application: InsertCreatorApplication): Promise<CreatorApplication>;
  getCreatorApplication(id: number): Promise<CreatorApplication | undefined>;
  getCreatorApplicationsByUser(userId: number): Promise<CreatorApplication[]>;
  
  // New game features
  awardBonusXP(userId: number, matchId: number): Promise<void>;
  processGamePayout(matchId: number): Promise<void>;
  markPlayerFinished(matchId: number, playerId: number, score: number): Promise<GameMatch>;
  calculateWinner(matchId: number): Promise<number | null>; // Returns winner ID or null if tied
  notifyGameResult(matchId: number, playerId: number): Promise<void>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      tableName: 'user_sessions',
      createTableIfMissing: false, 
      schemaName: 'public',
      pruneSessionInterval: false 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserScore(userId: number, score: number): Promise<void> {
    await db
      .update(users)
      .set({ score: score })
      .where(eq(users.id, userId));
  }

  async getLeaderboard(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(users.score, 'desc')
      .where(sql`${users.score} > 0`)
      .limit(10);
  }

  async createGameMatch(match: InsertGameMatch): Promise<GameMatch> {
    const [gameMatch] = await db
      .insert(gameMatches)
      .values({
        ...match,
        status: 'waiting',
        startTime: null,
        endTime: null,
      })
      .returning();
    return gameMatch;
  }

  async getGameMatch(id: number): Promise<GameMatch | undefined> {
    const [match] = await db
      .select()
      .from(gameMatches)
      .where(eq(gameMatches.id, id));
    return match;
  }

  async updateGameMatch(id: number, updates: Partial<GameMatch>): Promise<GameMatch> {
    const [match] = await db
      .update(gameMatches)
      .set(updates)
      .where(eq(gameMatches.id, id))
      .returning();

    if (!match) {
      throw new Error("Match not found");
    }
    return match;
  }

  async getActiveMatches(): Promise<GameMatch[]> {
    return await db
      .select()
      .from(gameMatches)
      .where(eq(gameMatches.status, 'waiting'))
      .orderBy(sql`${gameMatches.id} DESC`); // Show newest challenges first
  }

  async updateUserXP(userId: number, xp: number, updateScore: boolean): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const updates = {
      xp: (user.xp || 0) + xp,
      gamesPlayed: (user.gamesPlayed || 0) + 1
    };

    if (updateScore) {
      updates.score = (user.score || 0) + xp * 10;
    }

    await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId));
  }
}

export const storage = new DatabaseStorage();