import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import connectDB from "./db/db.js";
import redisClient from "./services/redis.service.js";
import userRoutes from "./routes/user.route.js";
import projectRoutes from "./routes/project.route.js";
import aiRoutes from "./routes/ai.route.js";

connectDB();
const app = express();

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000"
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or if in allowed list
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin '${origin}' is not allowed`), false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for preview iframe
  crossOriginEmbedderPolicy: false
}));

// Rate limiting — protect AI and auth endpoints from abuse
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 300 : 3000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." }
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === "production" ? 20 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "AI rate limit reached. Please wait before sending another prompt." }
});

app.use(globalLimiter);

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(morgan("dev"));
app.use(cookieParser());

// API Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/ai", aiLimiter, aiRoutes);

// Compatibility Routes (without /api/v1 prefix)
app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/ai", aiLimiter, aiRoutes);

// Health check endpoint
const getHealthStatus = () => ({
  status: "healthy",
  uptime: process.uptime(),
  timestamp: new Date().toISOString(),
  database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  redis: redisClient && redisClient.status === "ready" ? "connected" : "standalone/fallback",
  version: "2.5.0",
  service: "Fusion AI Studio Backend"
});

app.get("/api/health", (req, res) => {
  res.status(200).json(getHealthStatus());
});

app.get("/api/v1/health", (req, res) => {
  res.status(200).json(getHealthStatus());
});

app.get("/", (req, res) => {
  res.status(200).json({
    message: "🚀 Fusion AI Studio Backend Engine is Running",
    healthCheck: "/api/health",
    version: "2.5.0"
  });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error("[Backend Error Handler]:", err);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

export default app;