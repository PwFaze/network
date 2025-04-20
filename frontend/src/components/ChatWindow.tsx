"use client";

import React from "react";
import { ChatTarget, Group, MessageDTO } from "@/dto/Chat";
import { User } from "@/dto/User";
import ChatBubble from "./ChatBubble";
import { useChat } from "@/context/ChatProvider";

function isGroup(chat: ChatTarget): chat is Group {
  return (chat as Group).participants !== undefined;
}

function isUser(chat: ChatTarget): chat is User {
  return (chat as User).username !== undefined;
}

interface ChatWindowProps {
  selectedChat: Group | User | null;
  chat: MessageDTO[];
  setMessages: React.Dispatch<
    React.SetStateAction<{ [chatId: string]: MessageDTO[] }>
  >;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: (e: React.FormEvent) => void;
  setSelectedChat: React.Dispatch<React.SetStateAction<Group | User | null>>;
}

export default function ChatWindow({
  selectedChat,
  chat,
  setMessages,
  message,
  setMessage,
  handleSendMessage,
  setSelectedChat,
}: ChatWindowProps) {
  const { user, socket, activeUsers } = useChat();
  const handleDeleteMessage = (id: string) => {
    if (!selectedChat || !user) return;
    if ((selectedChat as Group).participants) {
      const fullGroup = selectedChat as Group;
      if (fullGroup && fullGroup.participants?.length) {
        const enrichedParticipants = fullGroup.participants.map(
          (participant) => {
            const active = activeUsers.find((u) => u.id === participant.id);
            return active ?? participant;
          },
        );

        (selectedChat as Group).participants = enrichedParticipants;
      } else {
        console.warn("Group not found or missing participants");
      }
    }
    socket?.emit("deleteMessage", {
      messageId: id,
      userId: user.id,
      receiver: selectedChat,
    });
    setMessages((prev) => {
      const chatId = selectedChat.id;
      const filtered = (prev[chatId] || []).filter((msg) => msg.id !== id);
      return {
        ...prev,
        [chatId]: filtered,
      };
    });
  };
  return (
    <div
      className={`${selectedChat ? "flex" : "hidden md:flex"} flex-1 bg-slate-50 p-4 relative flex flex-col md:p-4 md:py-12`}
    >
      {/* Chat Header */}
      <div className="bg-slate-50 text-gray-800 text-xl font-semibold mb-4">
        {selectedChat ? (
          <div className="flex items-center gap-2">
            <button
              className="md:hidden text-gray-800 text-2xl"
              onClick={() => setSelectedChat(null)}
            >
              ←
            </button>

            <div>
              {isGroup(selectedChat)
                ? `${selectedChat.name} (${selectedChat.participants.map((p) => p.username)})`
                : isUser(selectedChat)
                  ? selectedChat.username
                  : "Unknown"}
            </div>
            {/* Display online status */}
            {isUser(selectedChat) && (
              <div
                className={`text-sm ${
                  selectedChat ? "text-green-500" : "text-gray-500"
                }`}
              >
                {selectedChat ? "Online" : "Offline"}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">Select a chat</div>
        )}
      </div>

      {/* Message display area */}
      <div className="flex-1 border rounded p-2 overflow-y-auto bg-[#F0F4FA]">
        <ul>
          {chat?.map((msg, i) => (
            <li key={i} className="mb-1">
              <ChatBubble
                message={msg}
                onDelete={handleDeleteMessage}
                senderName={
                  msg.sender.id === user?.id ? "Me" : msg.sender.username
                }
                isOwnMessage={msg.sender.id === user?.id}
              />
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleSendMessage} className="p-4 flex gap-2">
        <input
          type="text"
          value={message}
          placeholder="Type something..."
          onChange={(e) => setMessage(e.target.value)}
          disabled={!selectedChat}
          className="flex-1 border px-3 py-2 rounded text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-600"
        />
        <button
          type="submit"
          className={`${
            selectedChat ? "bg-blue-500" : "bg-gray-400"
          } text-white px-4 py-2 rounded`}
        >
          Send
        </button>
      </form>
    </div>
  );
}
