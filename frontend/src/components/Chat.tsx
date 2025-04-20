"use client";

import { useCallback, useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import ContactList from "./ContactList";
import ChatWindow from "./ChatWindow";
import { Group, MessageDTO } from "@/dto/Chat";
import { ChatTarget } from "@/dto/Chat";
import { useChat } from "@/context/ChatProvider";
import { useAuth } from "@/context/AuthProvider";
import { getMessageByUserId } from "@/api/message";
import { getUserGroups, getUsers } from "@/api/user";
import { User } from "@/dto/User";

function isGroup(chat: ChatTarget): chat is Group {
  return (chat as Group).participants !== undefined;
}

export default function Chat() {
  const { user, activeUsers, sendMessage, onMessage, socket } = useChat();
  const auth = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<{ [chatId: string]: MessageDTO[] }>(
    {},
  );
  const [selectedChat, setSelectedChat] = useState<ChatTarget | null>(null);
  const [message, setMessage] = useState("");
  const [view, setView] = useState<"friends" | "groups">("friends");

  const [groups, setGroups] = useState<Group[]>([]);

  const fetchGroups = useCallback(async (userId: string) => {
    const response = await getUserGroups(userId);
    const transformedGroups = response.groups.map((group: Group) => ({
      ...group,
      id: group._id,
      participants: group.participants.map((participant: User) => ({
        ...participant,
        id: participant._id,
      })),
    }));
    setGroups(transformedGroups);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleDeletedMessage = (messageId: string) => {
      console.log("message deleated :", messageId);
      setMessages((prev) => {
        const updated = { ...prev };
        for (const chatId in updated) {
          updated[chatId] = updated[chatId].filter(
            (msg) => msg.id !== messageId,
          );
        }
        return updated;
      });
    };
    socket.on("messageDeleted", handleDeletedMessage);

    return () => {
      socket.off("messageDeleted", handleDeletedMessage);
    };
  }, [socket, messages]);

  useEffect(() => {
    if (user?.id) {
      fetchGroups(user?.id);
    }
  }, [user?.id, fetchGroups]);
  useEffect(() => {
    if (socket && user?.id) {
      // Remove any existing listeners to prevent duplicates
      socket.off("groupCreated");

      // Add the new listener
      socket.on("groupCreated", (data) => {
        console.log("Group created event received:", data);
        // Check if the current user is a participant
        if (user?.id && data.group.participants.includes(user?.id)) {
          console.log("Fetching groups for user:", user?.id);
          fetchGroups(user?.id);
        }
      });

      return () => {
        socket.off("groupCreated");
      };
    }
  }, [socket, user?.id, fetchGroups]); // Add all dependencies
  useEffect(() => {
    const unsubscribe = onMessage((msg) => {
      const isSender = msg.sender.id === user?.id;
      console.log("Message Received :", msg);
      setMessages((prev) => {
        const chatId =
          msg.group?.id ?? (isSender ? msg.receiver?.id : msg.sender.id);
        if (!chatId) return prev;

        const chatContent = prev[chatId] || [];

        const alreadyExists = chatContent.some((m) => m.id === msg.id);
        if (alreadyExists) return prev;

        return {
          ...prev,
          [chatId]: [...chatContent, msg],
        };
      });
    });

    return () => unsubscribe();
  }, [onMessage, user?.id]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedChat || message.trim() === "" || !user) return;
    const messageData: MessageDTO = {
      id: crypto.randomUUID(),
      sender: user,
      content: message,
      timestamp: new Date(),
    };

    if (isGroup(selectedChat)) {
      const fullGroup = groups.find((g) => g.id === selectedChat.id);

      if (fullGroup && fullGroup.participants?.length) {
        const enrichedParticipants = fullGroup.participants.map(
          (participant) => {
            const active = activeUsers.find((u) => u.id === participant.id);
            return active ?? participant;
          },
        );

        messageData.group = {
          ...fullGroup,
          participants: enrichedParticipants,
        };
      } else {
        console.warn("Group not found or missing participants");
      }
    } else {
      const updatedReceiver = activeUsers.find((u) => u.id === selectedChat.id);
      messageData.receiver = updatedReceiver ?? selectedChat;
    }
    sendMessage(messageData);

    setMessage("");
  };
  useEffect(() => {
    const fetchUsers = async () => {
      if (auth && user) {
        try {
          const data = await getUsers();
          setUsers(data);
          return data;
        } catch (error: unknown) {
          console.error("Error getting users :", error);
        }
      }
    };
    const fetchMessages = async () => {
      if (auth && user) {
        try {
          const data = await getMessageByUserId(user.id);
          const transformedMessages: { [chatId: string]: MessageDTO[] } =
            data.messages.reduce(
              (acc: { [chatId: string]: MessageDTO[] }, m: MessageDTO) => {
                let chatId: string;

                if (m.sender?._id === user.id) {
                  // User is the sender -> use receiver's ID (could be user or group)
                  chatId = m.receiver?._id ?? "";
                } else if (m.receiver?._id === user.id) {
                  // User is the receiver -> use sender's ID
                  chatId = m.sender?._id ?? "";
                } else {
                  // Neither sender nor receiver is the user -> group message
                  chatId = m.receiver?._id ?? "";
                }

                if (!acc[chatId]) {
                  acc[chatId] = [];
                }

                acc[chatId].push({
                  id: m._id ?? "",
                  sender: {
                    ...m.sender,
                    id: m.sender._id ?? "",
                  },
                  receiver: {
                    ...m.receiver,
                    username: m.receiver?.username ?? "",
                    id: m.receiver?._id ?? "",
                  },
                  content: m.content,
                  timestamp: m.timestamp,
                });

                return acc;
              },
              {},
            );

          setMessages(transformedMessages);
        } catch (err) {
          console.error("Failed to fetch messages:", err);
        }
      }
    };
    fetchUsers();
    fetchMessages();
  }, [auth, user]);
  return (
    <div className="relative h-screen">
      <div className="h-full flex flex-col md:flex-row filter-none">
        <Sidebar setView={setView} view={view} />
        <ContactList
          view={view}
          friends={activeUsers}
          groups={groups}
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
        />
        <ChatWindow
          selectedChat={selectedChat}
          chat={messages[selectedChat?.id ?? ""]}
          setMessages={setMessages}
          message={message}
          setMessage={setMessage}
          handleSendMessage={handleSendMessage}
          setSelectedChat={setSelectedChat}
        />
      </div>
    </div>
  );
}
