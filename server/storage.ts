import { 
  users, 
  gameMatches, 
  creatorApplications, 
  type User, 
  type GameMatch, 
  type InsertUser, 
  type InsertGameMatch,
  type CreatorApplication,
  type InsertCreatorApplication
} from "@shared/schema";
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
  getUserByWalletAddressAndDevice(walletAddress: string, deviceId: string): Promise<User | undefined>;
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
  
  async getUserByWalletAddressAndDevice(walletAddress: string, deviceId: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        sql`${users.walletAddress} = ${walletAddress} AND ${users.deviceId} = ${deviceId}`
      );
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
      .where(
        sql`${gameMatches.status} IN ('waiting', 'in_progress')`
      )
      .orderBy(sql`${gameMatches.id} DESC`); // Show newest challenges first
  }

  async updateUserXP(userId: number, xp: number, updateScore: boolean): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const updates = {
      xp: (user.xp || 0) + xp,
      gamesPlayed: (user.gamesPlayed || 0) + 1
    } as any;

    if (updateScore) {
      updates.score = (user.score || 0) + xp * 10;
    }

    await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId));
  }

  // Creator application methods
  async createCreatorApplication(application: InsertCreatorApplication): Promise<CreatorApplication> {
    const [creatorApp] = await db
      .insert(creatorApplications)
      .values(application)
      .returning();
    return creatorApp;
  }

  async getCreatorApplication(id: number): Promise<CreatorApplication | undefined> {
    const [application] = await db
      .select()
      .from(creatorApplications)
      .where(eq(creatorApplications.id, id));
    return application;
  }

  async getCreatorApplicationsByUser(userId: number): Promise<CreatorApplication[]> {
    return await db
      .select()
      .from(creatorApplications)
      .where(eq(creatorApplications.userId, userId));
  }

  // New game features
  async awardBonusXP(userId: number, matchId: number): Promise<void> {
    const match = await this.getGameMatch(matchId);
    if (!match) throw new Error("Match not found");
    
    // Only award bonus if match is in progress and bonus hasn't been awarded yet
    if (match.status === 'in_progress' && !match.bonusAwarded) {
      // Bonus XP amount - could be configurable
      const bonusXP = 50;
      
      // Update user's XP
      await this.updateUserXP(userId, bonusXP, true);
      
      // Mark bonus as awarded in the match
      await this.updateGameMatch(matchId, { bonusAwarded: true });
      
      console.log(`Awarded ${bonusXP} bonus XP to user ${userId} for joining match ${matchId} in progress`);
    }
  }
  
  async processGamePayout(matchId: number): Promise<void> {
    const match = await this.getGameMatch(matchId);
    if (!match) throw new Error("Match not found");
    
    // Only process payout if both players have finished and payout hasn't been processed yet
    if ((match.player1Finished && match.player2Finished) && !match.payoutProcessed) {
      const winnerId = await this.calculateWinner(matchId);
      
      if (winnerId) {
        // Get the bet amount
        const betAmount = match.betType === 'xp' ? parseInt(match.betAmount) : 0;
        
        if (match.betType === 'xp' && betAmount > 0) {
          // Update winner's XP
          const winner = await this.getUser(winnerId);
          if (winner) {
            // Award the bet amount (both player's bets)
            const winningAmount = betAmount * 2;
            await this.updateUserXP(winnerId, winningAmount, true);
            
            // Update games won count
            await db
              .update(users)
              .set({ gamesWon: (winner.gamesWon || 0) + 1 })
              .where(eq(users.id, winnerId));
              
            console.log(`Awarded ${winningAmount} XP to winner ${winnerId} for match ${matchId}`);
          }
        }
        
        // Update match with winner ID and mark payout as processed
        await this.updateGameMatch(matchId, { 
          winnerId, 
          payoutProcessed: true,
          status: 'completed'
        });
      } else {
        // It's a tie - return the bets to each player
        if (match.betType === 'xp') {
          const betAmount = parseInt(match.betAmount);
          
          if (match.player1Id) {
            await this.updateUserXP(match.player1Id, betAmount, false);
          }
          
          if (match.player2Id) {
            await this.updateUserXP(match.player2Id, betAmount, false);
          }
          
          console.log(`Match ${matchId} ended in a tie, returning bets to players`);
        }
        
        await this.updateGameMatch(matchId, { 
          payoutProcessed: true,
          status: 'completed'
        });
      }
    }
  }
  
  async markPlayerFinished(matchId: number, playerId: number, score: number): Promise<GameMatch> {
    const match = await this.getGameMatch(matchId);
    if (!match) throw new Error("Match not found");
    
    const updates: any = {};
    
    if (match.player1Id === playerId) {
      updates.player1Finished = true;
      updates.player1Score = score;
    } else if (match.player2Id === playerId) {
      updates.player2Finished = true;
      updates.player2Score = score;
    } else {
      throw new Error("Player is not part of this match");
    }
    
    // If both players are now finished, update match status
    if (
      (match.player1Finished || (match.player1Id === playerId && updates.player1Finished)) && 
      (match.player2Finished || (match.player2Id === playerId && updates.player2Finished))
    ) {
      updates.status = 'completed';
      updates.endTime = new Date();
    } else if (match.status === 'waiting' || match.status === 'in_progress') {
      // If only one player finished, update status accordingly
      updates.status = match.player1Id === playerId ? 'player1_finished' : 'player2_finished';
    }
    
    const updatedMatch = await this.updateGameMatch(matchId, updates);
    
    // Process payout if both players have finished
    if (updates.status === 'completed') {
      await this.processGamePayout(matchId);
    }
    
    return updatedMatch;
  }
  
  async calculateWinner(matchId: number): Promise<number | null> {
    const match = await this.getGameMatch(matchId);
    if (!match) throw new Error("Match not found");
    
    // Need both scores to determine a winner
    if (match.player1Score === undefined || match.player2Score === undefined) {
      return null;
    }
    
    // Compare scores to determine winner
    if (match.player1Score > match.player2Score) {
      return match.player1Id;
    } else if (match.player2Score > match.player1Score) {
      return match.player2Id;
    }
    
    // It's a tie
    return null;
  }
  
  async notifyGameResult(matchId: number, playerId: number): Promise<void> {
    const match = await this.getGameMatch(matchId);
    if (!match) throw new Error("Match not found");
    
    // Check if this is player1 or player2
    const isPlayer1 = match.player1Id === playerId;
    
    // Update notification status for the player
    const updates = isPlayer1 
      ? { player1Notified: true } 
      : { player2Notified: true };
      
    await this.updateGameMatch(matchId, updates);
    
    // In a real implementation, you might send an email or push notification here
    console.log(`Notified player ${playerId} about match ${matchId} results`);
  }
}

export const storage = new DatabaseStorage();