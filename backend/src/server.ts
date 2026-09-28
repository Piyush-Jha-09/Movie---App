import express from "express";
import cors from "cors";
import { config } from "./config/env";
import { logger } from "./utils/logger";
import healthRoutes from "./routes/health.routes";
import { notFoundHandler } from "./middleware/notFoundHandler";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// Middleware
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", healthRoutes);

// 404 & Centralized Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
app.listen(config.port, () => {
  logger.info(`🚀 CineVerse API server running in ${config.nodeEnv} mode on port ${config.port}`);
});

export default app;
