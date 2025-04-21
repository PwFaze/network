import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";
import { connectDB } from "./db/db";
import { setupSocketHandlers } from "./handlers/socket";

dotenv.config();

import auth from "./routes/auth";
import groups from "./routes/groups";
import messages from "./routes/messages";

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});
app.use("/api/auth", auth);
app.use("/api/groups", groups(io));
app.use("/api/messages", messages);

connectDB();
setupSocketHandlers(io);
server.listen(4000, () => {
  console.log("Socket.IO server running at port 4000");
});
