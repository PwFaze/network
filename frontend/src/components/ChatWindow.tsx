"use client";

import React from "react";
import { ChatTarget, Group, MessageDTO } from "@/dto/Chat";
import { User } from "@/dto/User";
import ChatBubble from "./ChatBubble";
import { useChat } from "@/context/ChatProvider";
import Avatar from "./Avatar";
import toast from "react-hot-toast";

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
  repliedMessage: MessageDTO | null;
  setRepliedMessage: React.Dispatch<React.SetStateAction<MessageDTO | null>>;
}

export default function ChatWindow({
  selectedChat,
  chat,
  setMessages,
  message,
  setMessage,
  handleSendMessage,
  setSelectedChat,
  repliedMessage,
  setRepliedMessage,
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
    } else {
      const active = activeUsers.find((u) => u.id === selectedChat.id);
      (selectedChat as User).socketId = active?.socketId;
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleLeaveGroup = async () => {
    if (!selectedChat || !user || !isGroup(selectedChat)) return;
    const groupId = selectedChat.id;
    const userId = user.id;
    socket?.emit("leaveGroup", { groupId, userId });
    toast.success("Leave Group Succes");
    setSelectedChat(null);
  };

  const handleReplyMessage = (message: MessageDTO) => {
    setRepliedMessage(message);
    setMessage(`@${message.sender.username} `);
  };
  return (
    <div
      className={`${
        selectedChat ? "flex" : "hidden md:flex"
      } flex-1 bg-slate-50 p-4 relative flex flex-col md:p-4 md:py-12`}
    >
      {/* Chat Header */}
      <div className="bg-slate-50 text-gray-800 text-xl font-semibold mb-4">
        {selectedChat ? (
          <div className="flex flex-row items-center gap-2">
            <button
              className="md:hidden text-gray-800 text-2xl"
              onClick={() => setSelectedChat(null)}
            >
              ←
            </button>
            {selectedChat && (
              <>
                <Avatar
                  username={
                    isGroup(selectedChat)
                      ? selectedChat.name
                      : selectedChat.username
                  }
                />
                <div>
                  {isGroup(selectedChat)
                    ? selectedChat.name
                    : selectedChat.username}
                </div>
              </>
            )}

            {/* leave group button */}
            {isGroup(selectedChat) && (
              <>
                {"(Member :"}
                {selectedChat.participants.map((p, index) => (
                  <p key={"member :" + p.id + index}>{p.username}</p>
                ))}
                {")"}
                <button
                  className="text-sm bg-red-400 text-white px-2 py-1 rounded hover:bg-red-600"
                  onClick={handleLeaveGroup}
                >
                  Leave
                </button>
              </>
            )}
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
          {chat?.map((msg) => (
            <li key={msg.id} className="mb-1">
              <ChatBubble
                message={msg}
                onDelete={handleDeleteMessage}
                senderName={
                  msg.sender.id === user?.id ? "Me" : msg.sender.username
                }
                isOwnMessage={msg.sender.id === user?.id}
                onReply={() => handleReplyMessage(msg)}
              />
            </li>
          ))}
        </ul>
      </div>

      {repliedMessage && (
        <div className="mb-2 border-l-4 border-blue-400 pl-3 bg-white rounded text-sm text-gray-700 py-2">
          <div className="text-xs text-gray-500">
            {repliedMessage.sender.username} said:
          </div>
          <div>{repliedMessage.content}</div>
          <button
            className="text-xs text-blue-600 mt-1 underline"
            onClick={() => setRepliedMessage(null)}
          >
            Cancel reply
          </button>
        </div>
      )}

      {/* send meassage */}
      <form onSubmit={handleSendMessage} className="p-4 flex gap-2">
        <input
          type="text"
          value={message}
          placeholder={
            user?.id !== selectedChat?.id
              ? "Type something..."
              : "You can't send messages to yourself"
          }
          onChange={(e) => setMessage(e.target.value)}
          disabled={!selectedChat || user?.id === selectedChat.id}
          className="flex-1 border px-3 py-2 rounded text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-600"
        />
        <button
          type="submit"
          className={`${
            selectedChat ? "bg-blue-500" : "bg-gray-400"
          } text-white px-4 py-2 rounded`}
          disabled={!selectedChat || user?.id === selectedChat.id}
        >
          Send
        </button>
      </form>
    </div>
  );
}
