import React from "react";

interface ChatBubbleProps {
  message: string;
  senderName: string;
  isOwnMessage: boolean;
}

export default function ChatBubble({
  message,
  senderName,
  isOwnMessage,
}: ChatBubbleProps) {
  return (
    <div
      className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}
    >
      <div className="text-xs text-gray-500 mb-1">{senderName}</div>
      <div
        className={`max-w-xs px-4 py-2 rounded-lg whitespace-pre-wrap break-words ${
          isOwnMessage
            ? "bg-sky-600 text-white rounded-br-none"
            : "bg-white text-gray-800 rounded-bl-none"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
