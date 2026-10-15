import "dotenv/config";
import Redis from "ioredis";

let redisClient = null;

try {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    lazyConnect: false,
    retryStrategy(times) {
      // Exponential backoff up to 3s
      const delay = Math.min(times * 150, 3000);
      return delay;
    },
    maxRetriesPerRequest: 2,
    enableOfflineQueue: false
  });

  redisClient.on("connect", () => {
    console.log("Redis is connected:", process.env.REDIS_HOST || "127.0.0.1");
  });

  redisClient.on("error", (error) => {
    // Log concisely without throwing uncaught exceptions
    console.warn("Redis notification:", error?.message || error);
  });
} catch (err) {
  console.warn("Redis initialization warning:", err.message);
}

// Fallback in-memory set for blacklisted tokens if Redis has connection issues
const memoryBlacklist = new Set();

export const isTokenBlacklisted = async (token) => {
  if (!token) return false;
  if (memoryBlacklist.has(token)) return true;
  try {
    if (redisClient && redisClient.status === "ready") {
      const val = await redisClient.get(token);
      return Boolean(val);
    }
  } catch (err) {
    console.warn("Redis get error, falling back to memory:", err.message);
  }
  return false;
};

export const blacklistToken = async (token, expireSeconds = 86400) => {
  if (!token) return;
  memoryBlacklist.add(token);
  setTimeout(() => memoryBlacklist.delete(token), expireSeconds * 1000);
  try {
    if (redisClient && redisClient.status === "ready") {
      await redisClient.set(token, "logout", "EX", expireSeconds);
    }
  } catch (err) {
    console.warn("Redis set error:", err.message);
  }
};

export default redisClient;