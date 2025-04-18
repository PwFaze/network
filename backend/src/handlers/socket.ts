import { Server, Socket } from "socket.io";
import { Message } from "../dto/ChatDTO";
import { User } from "../dto/UserDTO";

const users: User[] = [];

export const setupSocketHandlers = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("a user connected:", socket.id);

    socket.on("setUser", (user: User) => {
      users.push(user);

      io.emit("activeUsers", users);
    });

    socket.on("chat message", (msg: Message) => {
      if (msg.receiver) {
        io.to(msg.receiver.socketId ?? "").emit("chat message", msg);
      }
      // if (msg.groupId) {
      //   msg.groupId.participants.forEach((participant) => {
      //     io.to(participant.socket).emit("chat message", msg);
      //   });
      // }
    });
    socket.on("disconnect", () => {
      const index = users.findIndex((user) => user.socketId === socket.id);
      if (index !== -1) users.splice(index, 1);

      io.emit("activeUsers", users);
      console.log("User disconnected:", socket.id);
    });
  });
};
