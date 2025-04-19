"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import io, { Socket } from "socket.io-client";
import { User } from "@/dto/User";
import { Message } from "@/dto/Chat";

interface ChatContextType {
  user: User;
  setUser: (user: User) => void;
  joinChat: (user: User) => void;
  activeUsers: User[];
  sendMessage: (msg: Message) => void;
  onMessage: (cb: (msg: Message) => void) => () => void;
  socket: Socket | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

let socket: Socket;

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>({ username: "", id: "" });
  const [activeUsers, setActiveUsers] = useState<User[]>([]);

  useEffect(() => {
    socket = io("http://localhost:4000");

    socket.on("activeUsers", (users) => {
      setActiveUsers(users);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinChat = useCallback((user: User) => {
    console.log("joinChat", user);

    user.socketId = socket.id;
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    socket.emit("setUser", user);
  }, []);

  const sendMessage = useCallback((msg: Message) => {
    socket.emit("chat message", msg);
  }, []);

  const onMessage = useCallback(
    (cb: (msg: Message) => void) => {
      if (!socket) return () => {};
      socket.on("chat message", cb);
      return () => socket.off("chat message", cb);
    },
    [socket],
  );

  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        joinChat,
        activeUsers,
        sendMessage,
        onMessage,
        socket,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
