import { User, GameMatch, InsertUser, InsertGameMatch } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private matches: Map<number, GameMatch>;
  private currentUserId: number;
  private currentMatchId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.matches = new Map();
    this.currentUserId = 1;
    this.currentMatchId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress === walletAddress
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      score: 0,
      gamesPlayed: 0,
      gamesWon: 0
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserScore(userId: number, score: number): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      user.score += score;
      this.users.set(userId, user);
    }
  }

  async getLeaderboard(): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 10);
  }

  async createGameMatch(match: InsertGameMatch): Promise<GameMatch> {
    const id = this.currentMatchId++;
    const gameMatch: GameMatch = {
      ...match,
      id,
      player2Id: null,
      status: 'waiting',
      winnerId: null,
      startTime: null,
      endTime: null
    };
    this.matches.set(id, gameMatch);
    return gameMatch;
  }

  async getGameMatch(id: number): Promise<GameMatch | undefined> {
    return this.matches.get(id);
  }

  async updateGameMatch(id: number, updates: Partial<GameMatch>): Promise<GameMatch> {
    const match = await this.getGameMatch(id);
    if (!match) {
      throw new Error("Match not found");
    }
    const updatedMatch = { ...match, ...updates };
    this.matches.set(id, updatedMatch);
    return updatedMatch;
  }

  async getActiveMatches(): Promise<GameMatch[]> {
    return Array.from(this.matches.values())
      .filter(match => match.status !== 'completed');
  }
}

export const storage = new MemStorage();