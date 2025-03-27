// Force development mode and disable optional plugins
process.env.NODE_ENV = 'development';
// Prevent Cartographer plugin from loading during startup
process.env.REPL_ID = undefined;

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  log("Starting server initialization...", "startup");
  log(`Environment checks - NODE_ENV: ${process.env.NODE_ENV}, app.get("env"): ${app.get("env")}`, "startup");

  try {
    log("Registering routes...", "startup");
    const server = await registerRoutes(app);
    log("Routes registered successfully", "startup");

    // Improved error handling - log error but don't throw after response
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      log(`Error: ${message}`, "error");
      res.status(status).json({ message });
    });

    // Only serve Vite middleware in development
    log("Setting up Vite in development mode...", "startup");
    await setupVite(app, server);
    log("Vite setup complete", "startup");

    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`Server initialized and listening on port ${port}`, "startup");
    });
  } catch (error) {
    log(`Server initialization failed: ${error}`, "error");
    process.exit(1);
  }
})();