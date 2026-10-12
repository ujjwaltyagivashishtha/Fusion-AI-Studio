import "dotenv/config";
import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import projectModel from "./models/project.model.js";

const port = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server,{
    cors : {
        origin : "http://localhost:5173",
        methods : ["GET", "POST"],
        credentials: true
    }
});

io.use(async(socket, next) => {

  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];

    const projectId = socket.handshake.query.projectId;

    if(!mongoose.Types.ObjectId.isValid(projectId)){
      return next(new Error("Invalid project ID"));
    }

    socket.projectId = projectId;
    socket.project = await projectModel.findById(projectId);
    
    if (!token) {
      return next(new Error("Unauthorized user"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if(!decoded){
      return next(new Error("Unauthorized user"));
    }
    
    socket.user = decoded;
    next();
    
  } catch (error) {
    next(error)
  }
})
io.on('connection', socket => {
  const roomId = (socket.project?._id || socket.projectId).toString();
  console.log("User Connected", socket.id, "to project room:", roomId);

  socket.join(roomId);

  socket.on('project-message', (data) => {
    socket.broadcast.to(roomId).emit('project-message', data);
  });

  socket.on('event', data => { /* … */ });
  socket.on('disconnect', () => { 
    socket.leave(roomId);
  });
});



server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});