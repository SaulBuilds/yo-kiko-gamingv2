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
  setupAuth(app);
  const httpServer = createServer(app);

  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/game-ws',
    verifyClient: (info, done) => {
      log(`WebSocket connection attempt from ${info.req.headers.origin}`, 'websocket');
      // Accept all connections during development
      done(true);
    }
  });

  // Game routes
  app.get("/api/matches", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const matches = await storage.getActiveMatches();
    res.json(matches);
  });

  app.post("/api/matches", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const match = await storage.createGameMatch({
      player1Id: req.user.id,
      betAmount: req.body.betAmount,
      gameType: "tetris"
    });
    res.json(match);
  });

  app.get("/api/leaderboard", async (_req, res) => {
    const leaderboard = await storage.getLeaderboard();
    res.json(leaderboard);
  });

  // WebSocket handling for game state
  const gameStates = new Map<number, Map<number, GameState>>();
  const clients = new Map<WebSocket, number>();

  wss.on("connection", (ws, req) => {
    log(`New WebSocket connection established from ${req.headers.origin}`, 'websocket');

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

              // Broadcast to all clients in the match
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

    ws.on("error", (error) => {
      log(`WebSocket error: ${error}`, 'websocket');
    });

    ws.on("close", () => {
      const matchId = clients.get(ws);
      log(`Connection closed for match ${matchId}`, 'websocket');
      clients.delete(ws);
    });
  });

  wss.on("error", (error) => {
    log(`WebSocket server error: ${error}`, 'websocket');
  });

  return httpServer;
}