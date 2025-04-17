import express from "express";
import cors from "cors";
import { Server, Socket } from "socket.io";
import http from "http";
import dotenv from "dotenv";
import { connectDB } from "./db/db";
import { setupSocketHandlers } from "./handlers/socket";

dotenv.config();
const app = express();
const server = http.createServer(app);

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

connectDB();
setupSocketHandlers(io);
server.listen(4000, () => {
  console.log("Socket.IO server running at http://localhost:4000/");
});
