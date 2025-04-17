import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import "dotenv/config";
import { connectDB } from "./db/db";

const app = express();
const server = http.createServer(app);

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Frontend URL
    methods: ["GET", "POST"],
  },
});

connectDB();
io.on("conection", (socket: any) => {
  console.log("a user connected:", socket.id);

  socket.on("chat message", (msg: any) => {
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });
});

server.listen(4000, () => {
  console.log("Socket.IO server running at http://localhost:4000/");
});
