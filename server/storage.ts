import { users, gameMatches, type User, type GameMatch, type InsertUser, type InsertGameMatch } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserScore(userId: number, score: number): Promise<void>;
  getLeaderboard(): Promise<User[]>;
  createGameMatch(match: InsertGameMatch): Promise<GameMatch>;
  getGameMatch(id: number): Promise<GameMatch | undefined>;
  updateGameMatch(id: number, updates: Partial<GameMatch>): Promise<GameMatch>;
  getActiveMatches(): Promise<GameMatch[]>;
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
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
      .set({ 
        score: users.score + score, 
        gamesPlayed: users.gamesPlayed + 1 
      })
      .where(eq(users.id, userId));
  }

  async getLeaderboard(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(users.score, 'desc')
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
      .orderBy(gameMatches.id);
  }
}

export const storage = new DatabaseStorage();