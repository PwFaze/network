const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Frontend URL
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket: any) => {
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
