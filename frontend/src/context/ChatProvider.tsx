"use client";

import { MessageDTO } from "@/dto/Chat";
import { User } from "@/dto/User";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import io, { Socket } from "socket.io-client";
import { useAuth } from "./AuthProvider";

interface ChatContextType {
  user: User | null;
  setUser: (user: User) => void;
  joinChat: (user: User) => void;
  setActiveUsers: (users: User[]) => void;
  activeUsers: User[];
  sendMessage: (msg: MessageDTO) => void;
  onMessage: (cb: (msg: MessageDTO) => void) => () => void;
  socket: Socket | null;
  isConnected: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

let socket: Socket;

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const connectSocket = useCallback((token?: string) => {
    if (socket && socket.connected) return;

    socket = io(process.env.NEXT_PUBLIC_API_URL, {
      auth: token ? { token } : undefined,
    });

    socket.on("connect", () => {
      setIsConnected(true);

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const updatedUser = { ...parsedUser, socketId: socket.id };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        socket.emit("setUser", updatedUser);
      }
    });

    socket.on("activeUsers", (users) => {
      setActiveUsers(users);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });
  }, []);

  useEffect(() => {
    if (auth.token) {
      const token = auth?.token ?? "";
      connectSocket(token);
    } else {
      connectSocket(); // guest user
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [auth, connectSocket]);

  const joinChat = useCallback((user: User) => {
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);

    if (socket && socket.connected) {
      socket.emit("setUser", { ...user, socketId: socket.id });
    }
  }, []);

  const sendMessage = useCallback((msg: MessageDTO) => {
    if (socket) socket.emit("chat message", msg);
  }, []);

  const onMessage = useCallback((cb: (msg: MessageDTO) => void) => {
    if (!socket) return () => {};
    socket.on("chat message", cb);
    return () => socket.off("chat message", cb);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        joinChat,
        setActiveUsers,
        activeUsers,
        sendMessage,
        onMessage,
        socket,
        isConnected,
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
