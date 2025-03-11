import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { log } from "./vite";

interface GameState {
  board: number[][];
  score: number;
  level: number;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // User routes
  app.post("/api/user", async (req, res) => {
    try {
      const { walletAddress } = req.body;
      if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address is required" });
      }

      let user = await storage.getUserByWalletAddress(walletAddress);
      if (!user) {
        user = await storage.createUser({
          walletAddress,
          username: null,
          avatar: null,
        });
      }

      // Set up session
      if (req.session) {
        req.session.userId = user.id;
      }
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.get("/api/user", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Game match routes
  app.get("/api/matches", async (req, res) => {
    if (!req.session?.userId) return res.sendStatus(401);
    const matches = await storage.getActiveMatches();
    res.json(matches);
  });

  app.post("/api/matches", async (req, res) => {
    if (!req.session?.userId) return res.sendStatus(401);
    const match = await storage.createGameMatch({
      player1Id: req.session.userId,
      betAmount: req.body.betAmount,
      gameType: "tetris"
    });
    res.json(match);
  });

  app.get("/api/leaderboard", async (_req, res) => {
    const leaderboard = await storage.getLeaderboard();
    res.json(leaderboard);
  });

  // WebSocket handling
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/game-ws',
    verifyClient: (info, done) => {
      log(`WebSocket connection attempt from ${info.req.headers.origin}`, 'websocket');
      done(true);
    }
  });

  const gameStates = new Map<number, Map<number, GameState>>();
  const clients = new Map<WebSocket, number>();

  wss.on("connection", (ws, req) => {
    log(`New WebSocket connection established`, 'websocket');

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        log(`Received message: ${JSON.stringify(message)}`, 'websocket');

        switch (message.type) {
          case "join": {
            const { matchId, userId } = message;
            clients.set(ws, matchId);
            log(`User ${userId} joined match ${matchId}`, 'websocket');

            if (!gameStates.has(matchId)) {
              gameStates.set(matchId, new Map());
            }
            const match = await storage.getGameMatch(matchId);

            if (match?.status === "waiting") {
              await storage.updateGameMatch(matchId, {
                player2Id: userId,
                status: "in_progress",
                startTime: new Date()
              });
            }
            break;
          }

          case "gameState": {
            const { matchId, userId, state } = message;
            const matchStates = gameStates.get(matchId);
            if (matchStates) {
              matchStates.set(userId, state);
              wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN && clients.get(client) === matchId) {
                  client.send(JSON.stringify({
                    type: "gameState",
                    states: Array.from(matchStates.entries())
                  }));
                }
              });
            }
            break;
          }

          case "gameOver": {
            const { matchId, userId } = message;
            log(`Game over for match ${matchId}, winner: ${userId}`, 'websocket');
            const match = await storage.getGameMatch(matchId);
            if (match) {
              await storage.updateGameMatch(matchId, {
                status: "completed",
                winnerId: userId,
                endTime: new Date()
              });
              await storage.updateUserScore(userId, 100);
            }
            break;
          }
        }
      } catch (error) {
        log(`WebSocket error: ${error}`, 'websocket');
      }
    });

    ws.on("close", () => {
      const matchId = clients.get(ws);
      log(`Connection closed for match ${matchId}`, 'websocket');
      clients.delete(ws);
    });
  });

  setupAuth(app); // Added setupAuth here

  return httpServer;
}