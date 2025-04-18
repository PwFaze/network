"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import ContactList from "./ContactList";
import ChatWindow from "./ChatWindow";
import { GroupChat, Message } from "@/dto/Chat";
import { ChatTarget } from "@/dto/Chat";
import { useChat } from "@/hooks/useChat";
import { log } from "console";

function isGroupChat(chat: ChatTarget): chat is GroupChat {
  return (chat as GroupChat).participants !== undefined;
}

export default function Chat() {
  const { user, joinChat, activeUsers, sendMessage, onMessage, socket } =
    useChat();
  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  const [selectedChat, setSelectedChat] = useState<ChatTarget | null>(null);
  const [message, setMessage] = useState("");
  const [view, setView] = useState<"friends" | "groups">("friends");
  const [isMobile, setIsMobile] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication state

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

  const handleRegister = async () => {
    if (input.trim() && password.trim()) {
      try {
        const response = await fetch("http://localhost:4000/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: input,
            password: password,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          console.log("Registration successful:", data);
          joinChat({
            username: input,
            id: crypto.randomUUID(),
            socketId: socket?.id ?? "",
          });
          setIsAuthenticated(true); // Set authenticated state
        } else {
          console.error("Registration failed:", await response.text());
        }
      } catch (error) {
        console.error("Error during registration:", error);
      }
    }
  };

  const handleLogin = async () => {
    if (input.trim() && password.trim()) {
      try {
        const response = await fetch("http://localhost:4000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: input,
            password: password,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Login successful:", data);
          setIsAuthenticated(true); // Set authenticated state
          console.log("Token:", data.token);
          localStorage.setItem("token", data.token); // persists even after page reload
          joinChat({
            username: input,
            id: crypto.randomUUID(),
            socketId: socket?.id ?? "",
          });
        } else {
          console.error("Login failed:", await response.text());
        }
      } catch (error) {
        console.error("Error during login:", error);
      }
    }
  };

  const [tab, setTab] = useState<"register" | "login">("register");
  return (
    <div className="relative h-screen">
      {!isAuthenticated ? ( // Show authentication form if not authenticated
        <div className="absolute inset-0 z-50 flex flex-col items-center text-black justify-center bg-white bg-opacity-90 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded shadow-md p-6">
            <div className="flex justify-center mb-4">
              <button
                onClick={() => setTab("register")}
                className={`px-4 py-2 rounded-tl rounded-tr ${
                  tab === "register"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                Register
              </button>
              <button
                onClick={() => setTab("login")}
                className={`px-4 py-2 rounded-tl rounded-tr ${
                  tab === "login"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                Login
              </button>
            </div>

            {tab === "register" && (
              <div>
                <h2 className="text-2xl mb-4 text-center text-black">
                  Register
                </h2>
                <input
                  placeholder="Username"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="border rounded w-full px-4 py-2 mb-2 text-black"
                />
                <input
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border rounded w-full px-4 py-2 mb-2 text-black"
                />
                <button
                  onClick={handleRegister}
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
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border rounded w-full px-4 py-2 mb-2 text-black"
                />
                <button
                  onClick={handleLogin}
                  className="bg-blue-500 text-white w-full px-4 py-2 rounded hover:bg-blue-600"
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Show chat components if authenticated
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