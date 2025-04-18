"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import ContactList from "./ContactList";
import ChatWindow from "./ChatWindow";
import { GroupChat, Message } from "@/dto/Chat";
import { ChatTarget } from "@/dto/Chat";
import { useChat } from "@/hooks/useChat";

function isGroupChat(chat: ChatTarget): chat is GroupChat {
  return (chat as GroupChat).participants !== undefined;
}

export default function Chat() {
  const { user, joinChat, activeUsers, sendMessage, onMessage, socket } =
    useChat();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  const [selectedChat, setSelectedChat] = useState<ChatTarget | null>(null);
  const [message, setMessage] = useState("");
  const [view, setView] = useState<"friends" | "groups">("friends");
  const [isMobile, setIsMobile] = useState(false);

  const groups = [
    { name: "Family" },
    { name: "Work" },
    { name: "lndsc" },
    { name: "dscdsc" },
  ];

  useEffect(() => {
    const unsubscribe = onMessage((msg) => {
      setMessages((prev) => {
        const chatId = msg.sender.id;
        const chatContent = prev[chatId] || [];
        return {
          ...prev,
          [chatId]: [...chatContent, msg],
        };
      });
    });
    return unsubscribe;
  }, [onMessage]);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedChat || message.trim() === "") return;

    const messageData: Message = {
      id: crypto.randomUUID(),
      sender: user,
      content: message,
      timestamp: new Date(),
    };

    const chatId = selectedChat.id;

    if (isGroupChat(selectedChat)) {
      messageData.groupId = chatId;
    } else {
      messageData.receiver = selectedChat;
    }

    // Send via socket or server
    sendMessage(messageData);

    // Optimistically update UI
    setMessages((prev) => {
      const chatMessages = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: [...chatMessages, messageData],
      };
    });

    setMessage("");
  };

  const [tab, setTab] = useState<"register" | "login">("register");

  return (
    <div className="relative h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded shadow-md p-6">
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setTab("register")}
            className={`px-4 py-2 rounded-tl rounded-tr ${
              tab === "register" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
            }`}
          >
            Register
          </button>
          <button
            onClick={() => setTab("login")}
            className={`px-4 py-2 rounded-tl rounded-tr ${
              tab === "login" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
            }`}
          >
            Login
          </button>
        </div>

        {tab === "register" && (
          <div>
            <h2 className="text-2xl mb-4 text-center text-black">Register</h2>
            <input
              placeholder="Username"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="border rounded w-full px-4 py-2 mb-2 text-black"
            />
            <input
              placeholder="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="border rounded w-full px-4 py-2 mb-2 text-black"
            />
            <button
              onClick={() => {
                if (input.trim()) {
                  joinChat({
                    username: input,
                    id: crypto.randomUUID(),
                    socketId: socket?.id ?? "",
                  });
                }
              }}
              className="bg-blue-500 text-white w-full px-4 py-2 rounded hover:bg-blue-600"
            >
              Register
            </button>
          </div>
        )}

        {tab === "login" && (
          <div>
            <h2 className="text-2xl mb-4 text-center text-black">Login</h2>
            <input
              placeholder="Username"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="border rounded w-full px-4 py-2 mb-2 text-black"
            />
            <input
              placeholder="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="border rounded w-full px-4 py-2 mb-2 text-black"
            />
            <button
              onClick={() => {
                if (input.trim()) {
                  joinChat({
                    username: input,
                    id: crypto.randomUUID(),
                    socketId: socket?.id ?? "",
                  });
                }
              }}
              className="bg-blue-500 text-white w-full px-4 py-2 rounded hover:bg-blue-600"
            >
              Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}