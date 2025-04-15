import React from "react";
import { ChatTarget } from "./Chat";
import ChatBubble from "./ChatBubble";

interface ChatWindowProps {
  isMobile: boolean;
  selectedChat: ChatTarget | null;
  chat: string[];
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: (e: React.FormEvent) => void;
  setSelectedChat: React.Dispatch<React.SetStateAction<ChatTarget | null>>;
}

export default function ChatWindow({
  isMobile,
  selectedChat,
  chat,
  message,
  setMessage,
  sendMessage,
  setSelectedChat,
}: ChatWindowProps) {
  return (
    <div className="flex-1 bg-slate-50 p-4 relative flex flex-col md:p-4 md:py-12">
      {/* Chat Header */}
      <div className="bg-slate-50 text-gray-800 text-xl font-semibold mb-4">
        {selectedChat ? (
          <div className="flex items-center gap-2">
            {isMobile && (
              <button
                className="text-gray-800 text-2xl"
                onClick={() => setSelectedChat(null)}
              >
                ←
              </button>
            )}
            <div>{selectedChat.name}</div>
            {/* Display online status */}
            {selectedChat.type === "user" && (
              <div
                className={`text-sm ${
                  selectedChat.isOnline ? "text-green-500" : "text-gray-500"
                }`}
              >
                {selectedChat.isOnline ? "Online" : "Offline"}
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
          {chat.map((msg, i) => (
            <li key={i} className="mb-1">
              <ChatBubble
                message={msg}
                senderName={
                  i % 2 === 0 ? "Me" : selectedChat?.name || "Unknown"
                }
                isOwnMessage={i % 2 === 0}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* Message input form */}
      <form onSubmit={sendMessage} className="p-4 flex gap-2">
        <input
          type="text"
          value={message}
          placeholder="Type something..."
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border px-3 py-2 rounded text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-600"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </form>
    </div>
  );
}
