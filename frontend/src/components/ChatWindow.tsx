import React from "react";
import { ChatTarget, GroupChat, Message } from "@/dto/Chat";
import { User } from "@/dto/User";
import ChatBubble from "./ChatBubble";
import { useChat } from "@/hooks/useChat";

function isGroupChat(chat: ChatTarget): chat is GroupChat {
  return (chat as GroupChat).participants !== undefined;
}

function isUser(chat: ChatTarget): chat is User {
  return (chat as User).username !== undefined;
}

interface ChatWindowProps {
  isMobile: boolean;
  selectedChat: GroupChat | User | null;
  chat: Message[];
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: (e: React.FormEvent) => void;
  setSelectedChat: React.Dispatch<
    React.SetStateAction<GroupChat | User | null>
  >;
}

export default function ChatWindow({
  isMobile,
  selectedChat,
  chat,
  message,
  setMessage,
  handleSendMessage,
  setSelectedChat,
}: ChatWindowProps) {
  const { user } = useChat();

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
            <div>
              {isGroupChat(selectedChat)
                ? selectedChat.name
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
                message={msg.content}
                senderName={
                  msg.sender.id === user.id ? "Me" : msg.sender.username
                }
                isOwnMessage={msg.sender.id === user.id}
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
