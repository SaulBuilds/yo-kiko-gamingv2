import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { log } from "./vite";
import session from "express-session";

interface GameState {
  board: number[][];
  score: number;
  level: number;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Session middleware setup
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'your-secret-key',
      resave: false,
      saveUninitialized: false,
      store: storage.sessionStore,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    })
  );

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

      // Set the session
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
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

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

  // Add XP update function
  app.post("/api/user/xp", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { xp, isPractice } = req.body;
      await storage.updateUserXP(req.session.userId, xp, !isPractice);

      const updatedUser = await storage.getUser(req.session.userId);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating XP:", error);
      res.status(500).json({ error: "Failed to update XP" });
    }
  });

  // Game match routes
  app.get("/api/matches", async (req, res) => {
    if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
    const matches = await storage.getActiveMatches();
    res.json(matches);
  });

  app.get("/api/matches/:id", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const match = await storage.getGameMatch(parseInt(req.params.id));
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }
      res.json(match);
    } catch (error) {
      console.error("Error fetching match:", error);
      res.status(500).json({ error: "Failed to fetch match" });
    }
  });

  app.post("/api/matches", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const match = await storage.createGameMatch({
        player1Id: req.session.userId,
        betAmount: req.body.betAmount || "0",
        gameType: req.body.gameType || "tetris",
        isPractice: req.body.isPractice || false,
        betType: req.body.betType || 'xp',
        timeLimit: req.body.timeLimit || null
      });

      // If it's a practice game, automatically set it to in_progress
      if (match.isPractice) {
        await storage.updateGameMatch(match.id, {
          status: "in_progress",
          startTime: new Date()
        });
      }

      res.json(match);
    } catch (error) {
      console.error("Error creating match:", error);
      res.status(500).json({ error: "Failed to create match" });
    }
  });

  app.post("/api/matches/:id/join", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const matchId = parseInt(req.params.id);
      const match = await storage.getGameMatch(matchId);

      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      if (match.status !== "waiting") {
        return res.status(400).json({ error: "Match is not available for joining" });
      }

      const updatedMatch = await storage.updateGameMatch(matchId, {
        player2Id: req.session.userId,
        status: "in_progress",
        startTime: new Date()
      });

      res.json(updatedMatch);
    } catch (error) {
      console.error("Error joining match:", error);
      res.status(500).json({ error: "Failed to join match" });
    }
  });

  app.post("/api/matches/:id/finish", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const matchId = parseInt(req.params.id);
      const { score } = req.body;
      const match = await storage.getGameMatch(matchId);

      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      // Update match with score
      const updates = {
        status: "completed" as const,
        endTime: new Date()
      };

      if (match.player1Id === req.session.userId) {
        updates.player1Score = score;
      } else if (match.player2Id === req.session.userId) {
        updates.player2Score = score;
      }

      const updatedMatch = await storage.updateGameMatch(matchId, updates);
      res.json(updatedMatch);
    } catch (error) {
      console.error("Error finishing match:", error);
      res.status(500).json({ error: "Failed to finish match" });
    }
  });

  app.get("/api/leaderboard", async (_req, res) => {
    const leaderboard = await storage.getLeaderboard();
    res.json(leaderboard);
  });

  // WebSocket handling
  const wss = new WebSocketServer({
    server: httpServer,
    path: '/ws'  // Match the client-side WebSocket path
  });

  const gameStates = new Map<number, Map<number, GameState>>();
  const clients = new Map<WebSocket, number>();

  wss.on("connection", (ws) => {
    log("New WebSocket connection established", "websocket");

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        log(`Received message: ${JSON.stringify(message)}`, "websocket");

        switch (message.type) {
          case "join": {
            const { matchId, userId } = message;
            clients.set(ws, matchId);
            log(`User ${userId} joined match ${matchId}`, "websocket");

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
            const { matchId, userId, score } = message;
            log(`Game over for match ${matchId}, score: ${score}`, "websocket");
            const match = await storage.getGameMatch(matchId);
            if (match) {
              const updates: any = {
                status: "completed",
                endTime: new Date()
              };

              if (match.player1Id === userId) {
                updates.player1Score = score;
              } else if (match.player2Id === userId) {
                updates.player2Score = score;
              }

              if (updates.player1Score && updates.player2Score) {
                updates.winnerId = updates.player1Score > updates.player2Score ? match.player1Id : match.player2Id;
              }

              await storage.updateGameMatch(matchId, updates);
            }
            break;
          }
        }
      } catch (error) {
        log(`WebSocket error: ${error}`, "websocket");
      }
    });

    ws.on("close", () => {
      const matchId = clients.get(ws);
      log(`Connection closed for match ${matchId}`, "websocket");
      clients.delete(ws);
    });
  });

  setupAuth(app);

  return httpServer;
}