"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";
import Sidebar from "./Sidebar";
import ContactList from "./ContactList";
import ChatWindow from "./ChatWindow";

const socket = io("http://localhost:4000");

export interface ChatTarget {
  type: "user" | "group";
  name: string;
  isOnline: boolean;
}

export default function Chat() {
  const friends = [
    { name: "Pon", isOnline: true },
    { name: "Faze", isOnline: false },
    { name: "Pun", isOnline: true },
    { name: "Tantorn", isOnline: false },
    { name: "Pon", isOnline: true },
    { name: "JRP", isOnline: false },
    { name: "JJJ", isOnline: true },
  ];

  const groups = [
    { name: "Family" },
    { name: "Work" },
    { name: "lndsc" },
    { name: "dscdsc" },
  ];

  const chats = ["Me", "You", "Me", "You"];

  const [selectedChat, setSelectedChat] = useState<ChatTarget | null>(null);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<string[]>(chats);
  const [view, setView] = useState<"friends" | "groups">("friends");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    socket.on("chat message", (msg) => {
      setChat((prev) => [...prev, msg]);
    });
    return () => {
      socket.off("chat message");
    };
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === "") return;
    socket.emit("chat message", message);
    setChat((prev) => [...prev, message]); // Add message to chat
    setMessage(""); // Clear input field
  };

  return (
    <div className="h-screen flex flex-col md:flex-row">
      <Sidebar setView={setView} />
      {(!isMobile || (isMobile && !selectedChat)) && (
        <ContactList
          view={view}
          friends={friends}
          groups={groups}
          setSelectedChat={setSelectedChat}
        />
      )}
      {(!isMobile || (isMobile && selectedChat)) && (
        <ChatWindow
          isMobile={isMobile}
          selectedChat={selectedChat}
          chat={chat}
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
          setSelectedChat={setSelectedChat}
        />
      )}
    </div>
  );
}
