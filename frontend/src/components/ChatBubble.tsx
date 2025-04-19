import { MessageDTO } from "@/dto/Chat";
import React from "react";

interface ChatBubbleProps {
  message: MessageDTO;
  senderName: string;
  onDelete: (messageId: string) => void;
  isOwnMessage: boolean;
}

export default function ChatBubble({
  message,
  senderName,
  onDelete,
  isOwnMessage,
}: ChatBubbleProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (!isOwnMessage) return;
    e.preventDefault();
    if (confirm("Delete this message?")) {
      onDelete(message.id);
    }
  };
  return (
    <div
      className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}
      onClick={handleClick}
    >
      <div className="text-xs text-gray-500 mb-1">{senderName}</div>
      <div
        className={`max-w-xs px-4 py-2 rounded-lg whitespace-pre-wrap break-words ${
          isOwnMessage
            ? "bg-sky-600 text-white rounded-br-none"
            : "bg-white text-gray-800 rounded-bl-none"
        }`}
      >
        {message.content}
      </div>
      {isOwnMessage && (
        <p className="text-black text-xs opacity-40 cursor-pointer">
          delete message
        </p>
      )}
    </div>
  );
}
