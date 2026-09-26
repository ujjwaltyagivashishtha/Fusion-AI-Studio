import dotenv from "dotenv";
dotenv.config();import http from "http";
import app from "./app.js";

const port = process.env.Port || 3000;

const server = http.createServer(app);



server.listen(port, ()=>{
  console.log(`Server is running on port ${port}`);
});