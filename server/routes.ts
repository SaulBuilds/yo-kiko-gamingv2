import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { db } from "./db";
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
      const { walletAddress, walletType, deviceId } = req.body;
      if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address is required" });
      }

      // Generate a device fingerprint if not provided
      const deviceFingerprint = deviceId || 
        `${req.headers['user-agent'] || 'unknown'}-${req.ip || 'unknown'}`;
      
      // For Internet Identity, search with both wallet address and device
      if (walletType === 'icp') {
        // Look up existing user by both ICP address and device fingerprint
        let user = await storage.getUserByWalletAddressAndDevice(walletAddress, deviceFingerprint);
        
        if (!user) {
          // If no user found for this address+device combo, create a new one
          user = await storage.createUser({
            walletAddress,
            walletType: 'icp',
            deviceId: deviceFingerprint,
            username: null,
            avatar: null,
          });
          log(`Created new ICP user for device: ${deviceFingerprint}`, "auth");
        }
        
        // Set the session
        if (req.session) {
          req.session.userId = user.id;
          req.session.deviceId = deviceFingerprint;
        }
        res.json(user);
      } else {
        // For non-ICP wallets, use original wallet-based lookup
        let user = await storage.getUserByWalletAddress(walletAddress);
        if (!user) {
          user = await storage.createUser({
            walletAddress,
            walletType: walletType || 'eth',
            deviceId: deviceFingerprint,
            username: null,
            avatar: null,
          });
        }

        // Set the session
        if (req.session) {
          req.session.userId = user.id;
          req.session.deviceId = deviceFingerprint;
        }
        res.json(user);
      }
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

      const { xp, isPractice, isMatch } = req.body;
      console.log(`XP Update - User: ${req.session.userId}, XP: ${xp}, isPractice: ${isPractice}, isMatch: ${isMatch}`);
      
      // Only increment games played if it's a new game completion
      await storage.updateUserXP(
        req.session.userId, 
        xp, 
        !isPractice, // Only update score for non-practice games
        isMatch ? false : !isPractice // Only increment games played if it's not part of a match and not practice
      );

      const updatedUser = await storage.getUser(req.session.userId);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating XP:", error);
      res.status(500).json({ error: "Failed to update XP" });
    }
  });

  // Add after user routes and before matches routes
  app.post("/api/creator-applications", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const creatorApp = await storage.createCreatorApplication({
        ...req.body,
        userId: req.session.userId
      });

      res.status(201).json(creatorApp);
    } catch (error) {
      console.error("Error creating creator application:", error);
      res.status(500).json({ error: "Failed to submit application" });
    }
  });

  // Add these routes before setting up WebSocket
  app.get("/api/creator-applications/:id", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const application = await storage.getCreatorApplication(parseInt(req.params.id));
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      // Only allow users to view their own applications
      if (application.userId !== req.session.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      res.json(application);
    } catch (error) {
      console.error("Error fetching creator application:", error);
      res.status(500).json({ error: "Failed to fetch application" });
    }
  });

  app.get("/api/creator-applications", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const applications = await storage.getCreatorApplicationsByUser(req.session.userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching creator applications:", error);
      res.status(500).json({ error: "Failed to fetch applications" });
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
        betAmount: req.body.betAmount,
        betType: req.body.betType || 'xp',
        cryptoType: req.body.betType === 'crypto' ? req.body.cryptoType : undefined,
        gameType: req.body.gameType || "tetris",
        isPractice: req.body.isPractice || false,
        timeLimit: req.body.timeLimit
      });
      
      // Broadcast the updated matches list to all connected dashboard clients
      broadcastActiveMatches();
      
      res.json(match);
    } catch (error) {
      console.error("Error creating match:", error);
      res.status(500).json({ error: "Failed to create match" });
    }
  });

  app.post("/api/matches/:id/finish", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const matchId = parseInt(req.params.id);
      const userId = req.session.userId;
      const { score } = req.body;
      const match = await storage.getGameMatch(matchId);

      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      // Mark the player as finished and update their score
      const updatedMatch = await storage.markPlayerFinished(matchId, userId, score);
      
      // Broadcast the updated matches list to all connected dashboard clients
      broadcastActiveMatches();
      
      // Send a message to the specific match room if it exists
      const matchRoom = `match:${matchId}`;
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && (client as any).matchRoom === matchRoom) {
          client.send(JSON.stringify({
            type: 'MATCH_UPDATE',
            match: updatedMatch
          }));
        }
      });
      
      // If match is completed, delay a bit to process payout
      if (updatedMatch.status === 'completed') {
        await storage.processGamePayout(matchId);
      }
      
      // Notify this player of the result
      await storage.notifyGameResult(matchId, userId);
      
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
  
  // Admin endpoint to view all users (for testing purposes)
  app.get("/api/admin/users", async (_req, res) => {
    try {
      // Get all users from the database
      const result = await db.query.users.findMany();
      res.json(result);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // WebSocket handling
  const wss = new WebSocketServer({
    server: httpServer,
    path: '/game-ws'
  });

  const gameStates = new Map<number, Map<number, GameState>>();
  const clients = new Map<WebSocket, { matchId?: number, userId?: number, dashboardUser: boolean }>();

  // Helper function to broadcast active matches to all dashboard clients
  const broadcastActiveMatches = async () => {
    const activeMatches = await storage.getActiveMatches();
    log(`Broadcasting ${activeMatches.length} active matches to all dashboard clients`, "websocket");
    
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && clients.get(client)?.dashboardUser) {
        client.send(JSON.stringify({
          type: "activeMatches",
          matches: activeMatches
        }));
      }
    });
  };

  wss.on("connection", (ws) => {
    log("New WebSocket connection established", "websocket");
    // By default, track this as a dashboard client
    clients.set(ws, { dashboardUser: true });

    // Send active matches immediately upon connection
    broadcastActiveMatches();

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        log(`Received message: ${JSON.stringify(message)}`, "websocket");

        switch (message.type) {
          case "dashboard": {
            // Client is requesting to receive dashboard updates (match challenges)
            const { userId } = message;
            clients.set(ws, { userId, dashboardUser: true });
            log(`User ${userId} connected to dashboard`, "websocket");
            // Send the most recent active matches
            broadcastActiveMatches();
            break;
          }
            
          case "join": {
            const { matchId, userId } = message;
            clients.set(ws, { matchId, userId, dashboardUser: false });
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
              
              // Broadcast updates since match status changed
              broadcastActiveMatches();
            }
            break;
          }

          case "gameState": {
            const { matchId, userId, state } = message;
            const matchStates = gameStates.get(matchId);
            if (matchStates) {
              matchStates.set(userId, state);
              wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN && clients.get(client)?.matchId === matchId) {
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
            log(`Game over for match ${matchId}, user ${userId}, score: ${score}`, "websocket");
            
            try {
              // Mark the player as finished with their score
              const updatedMatch = await storage.markPlayerFinished(matchId, userId, score);
              
              // Notify this player that we processed their result
              await storage.notifyGameResult(matchId, userId);
              
              // Broadcast updates since match status changed
              broadcastActiveMatches();
              
              // Send an update to all clients in this match
              wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN && clients.get(client)?.matchId === matchId) {
                  client.send(JSON.stringify({
                    type: "matchUpdate",
                    match: updatedMatch
                  }));
                }
              });
              
              log(`Updated match ${matchId} status: ${updatedMatch.status}`, "websocket");
            } catch (error) {
              log(`Error processing game over: ${error}`, "websocket");
            }
            break;
          }
        }
      } catch (error) {
        log(`WebSocket error: ${error}`, "websocket");
      }
    });

    ws.on("close", () => {
      const client = clients.get(ws);
      log(`Connection closed for user ${client?.userId}, match ${client?.matchId}`, "websocket");
      clients.delete(ws);
    });
  });

  setupAuth(app);

  return httpServer;
}