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

  return (
    <div className="relative h-screen">
      {!user.username && (
        <div className="absolute inset-0 z-50 flex flex-col items-center text-black justify-center bg-white bg-opacity-90 backdrop-blur-sm">
          <h2 className="text-2xl mb-4">Enter your username</h2>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="border rounded px-4 py-2 mb-2"
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
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Join
          </button>
        </div>
      )}

      {user && (
        <div className="h-full flex flex-col md:flex-row filter-none">
          <Sidebar setView={setView} view={view} />
          {(!isMobile || (isMobile && !selectedChat)) && (
            <ContactList
              view={view}
              friends={activeUsers}
              groups={groups}
              setSelectedChat={setSelectedChat}
            />
          )}
          {(!isMobile || (isMobile && selectedChat)) && (
            <ChatWindow
              isMobile={isMobile}
              selectedChat={selectedChat}
              chat={messages[selectedChat?.id ?? ""]}
              message={message}
              setMessage={setMessage}
              handleSendMessage={handleSendMessage}
              setSelectedChat={setSelectedChat}
            />
          )}
        </div>
      )}
    </div>
  );
}
