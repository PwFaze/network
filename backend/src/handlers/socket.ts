import { Server, Socket } from "socket.io";
import { UserDTO } from "../dto/UserDTO";
import { registerMessageHandler } from "./message";
import { joinGroupSocket, leaveGroupSocket } from "./groups";

const users: UserDTO[] = [];

export const setupSocketHandlers = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("a user connected:", socket.id);

    socket.on("setUser", (user: UserDTO) => {
      users.filter((u) => u.id !== user.id);
      users.push(user);

      io.emit("activeUsers", users);
    });
    registerMessageHandler(io, socket);
    joinGroupSocket(io, socket);
    leaveGroupSocket(io, socket);

    socket.on("disconnect", () => {
      const index = users.findIndex((user) => user.socketId === socket.id);
      if (index !== -1) users.splice(index, 1);

      io.emit("activeUsers", users);
      console.log("User disconnected:", socket.id);
    });
  });
};
