import "dotenv/config";
import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import projectModel from "./models/project.model.js";
import { addProjectMessageService } from "./services/project.service.js";
import { processAiPrompt } from "./services/ai.service.js";

const port = process.env.PORT || 3000;
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000"
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Room users registry: roomId -> Map<socketId, { socketId, userId, email, joinedAt }>
const roomUsers = new Map();

const getUniqueRoomUsers = (roomId) => {
  const usersMap = roomUsers.get(roomId);
  if (!usersMap) return [];
  const uniqueUsers = new Map();
  for (const info of usersMap.values()) {
    const key = info.email || info.userId || info.socketId;
    if (!uniqueUsers.has(key)) {
      uniqueUsers.set(key, {
        userId: info.userId,
        email: info.email,
        name: (info.email || "Developer").split("@")[0]
      });
    }
  }
  return Array.from(uniqueUsers.values());
};

// Socket Authentication & Authorization Middleware
io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.split(" ")[1];

    const projectId = socket.handshake.query?.projectId;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error("Invalid project ID"));
    }

    if (!token) {
      return next(new Error("Unauthorized user: missing token"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return next(new Error("Unauthorized user: invalid token"));
    }

    socket.projectId = projectId;
    socket.user = decoded;

    const project = await projectModel.findById(projectId);
    if (!project) {
      return next(new Error("Project not found"));
    }

    socket.project = project;
    next();
  } catch (error) {
    next(error);
  }
});

// Socket Event Connection Pipeline
io.on("connection", (socket) => {
  const roomId = (socket.project?._id || socket.projectId).toString();
  const userEmail = socket.user?.email || "anonymous";
  const userId = socket.user?._id;

  socket.join(roomId);

  // Register in room tracker
  if (!roomUsers.has(roomId)) {
    roomUsers.set(roomId, new Map());
  }
  const currentRoomMap = roomUsers.get(roomId);
  currentRoomMap.set(socket.id, {
    socketId: socket.id,
    userId,
    email: userEmail,
    joinedAt: new Date()
  });

  console.log(`[Socket] User ${userEmail} (${socket.id}) connected to workspace ${roomId}`);

  // Broadcast updated room users
  io.to(roomId).emit("room-users", {
    roomId,
    users: getUniqueRoomUsers(roomId)
  });

  // Notify collaborators
  socket.to(roomId).emit("user-joined", {
    email: userEmail,
    userId,
    name: userEmail.split("@")[0]
  });

  // 1. Real-time Project Chat Message
  socket.on("project-message", async (data) => {
    try {
      const msgText = typeof data === "string" ? data : data?.message;
      if (!msgText) return;

      const messageObj = {
        message: msgText,
        sender: socket.user,
        projectId: roomId,
        timestamp: new Date().toISOString()
      };

      // Persist to MongoDB project chat history
      await addProjectMessageService({
        projectId: roomId,
        messageData: {
          text: msgText,
          sender: userId || "user",
          senderName: userEmail.split("@")[0],
          timestamp: new Date()
        }
      }).catch((e) => console.warn("Failed to persist message:", e.message));

      // Broadcast to all other users in this project room
      socket.broadcast.to(roomId).emit("project-message", messageObj);
    } catch (err) {
      console.error("[Socket] project-message error:", err.message);
    }
  });

  // 2. Real-time Collaborative File Change
  socket.on("file-change", (data) => {
    // data: { fileName, content }
    socket.to(roomId).emit("file-change", {
      ...data,
      sender: {
        email: userEmail,
        userId
      }
    });
  });

  // 3. Real-time File Creation
  socket.on("file-create", (data) => {
    socket.to(roomId).emit("file-create", {
      ...data,
      sender: {
        email: userEmail,
        userId
      }
    });
  });

  // 4. Real-time File Deletion
  socket.on("file-delete", (data) => {
    socket.to(roomId).emit("file-delete", {
      ...data,
      sender: {
        email: userEmail,
        userId
      }
    });
  });

  // 5. Typing Indicator
  socket.on("user-typing", (data) => {
    socket.to(roomId).emit("user-typing", {
      email: userEmail,
      name: userEmail.split("@")[0],
      isTyping: Boolean(data?.isTyping),
      fileName: data?.fileName
    });
  });

  // 6. Direct AI Prompt through Socket
  socket.on("ai-prompt", async (data) => {
    try {
      const { prompt, activeFile, fileContent, mode, files } = data || {};
      if (!prompt) return;

      const aiResponse = await processAiPrompt({
        prompt,
        activeFile,
        fileContent,
        mode,
        files
      });

      // Emit to sender and room as AI message
      io.to(roomId).emit("ai-response", {
        prompt,
        sender: "ai",
        senderName: "Fusion AI",
        ...aiResponse,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      socket.emit("ai-error", { message: err.message });
    }
  });

  // Disconnection handler
  socket.on("disconnect", () => {
    console.log(`[Socket] User ${userEmail} (${socket.id}) disconnected from ${roomId}`);
    socket.leave(roomId);

    const roomMap = roomUsers.get(roomId);
    if (roomMap) {
      roomMap.delete(socket.id);
      if (roomMap.size === 0) {
        roomUsers.delete(roomId);
      }
    }

    io.to(roomId).emit("room-users", {
      roomId,
      users: getUniqueRoomUsers(roomId)
    });

    socket.to(roomId).emit("user-left", {
      email: userEmail,
      userId,
      name: userEmail.split("@")[0]
    });
  });
});

server.listen(port, () => {
  console.log(`🚀 Fusion AI Studio Backend Server running on port ${port}`);
});