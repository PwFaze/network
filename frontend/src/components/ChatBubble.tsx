import { MessageDTO } from "@/dto/Chat";
import React from "react";
import Avatar from "./Avatar";

interface ChatBubbleProps {
  message: MessageDTO;
  senderName: string;
  onDelete: (messageId: string) => void;
  isOwnMessage: boolean;
  onReply?: () => void;
}

export default function ChatBubble({
  message,
  senderName,
  onDelete,
  isOwnMessage,
  onReply,
}: ChatBubbleProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (!isOwnMessage) return;
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Delete this message?")) {
      onDelete(message.id);
    }
  };
  return (
    <div
      className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}
    >
      {message.repliedMessage && (
        <div className="border-l-4 border-gray-300 pl-2 mb-1">
          <div className="text-xs text-gray-500">
            {message.repliedMessage.sender.username}
          </div>
          <div className="text-sm text-gray-600">
            {message.repliedMessage.content}
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">
        {!isOwnMessage && <Avatar username={senderName} />}
        <div className="text-xs text-gray-500 mb-1">{senderName}</div>
      </div>
      <div
        className={`max-w-xs px-4 py-2 rounded-lg whitespace-pre-wrap break-words ${
          isOwnMessage
            ? "bg-sky-600 text-white rounded-br-none"
            : "bg-white text-gray-800 rounded-bl-none"
        }`}
      >
        {message.content}
      </div>
      {onReply && (
        <p
          onClick={onReply}
          className="text-xs text-blue-500 cursor-pointer hover:underline"
        >
          Reply
        </p>
      )}
      {isOwnMessage && (
        <p
          className="text-black text-xs opacity-40 cursor-pointer"
          onClick={handleClick}
        >
          delete message
        </p>
      )}
    </div>
  );
}
