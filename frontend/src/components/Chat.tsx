"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import ContactList from "./ContactList";
import ChatWindow from "./ChatWindow";
import { Group, MessageDTO } from "@/dto/Chat";
import { ChatTarget } from "@/dto/Chat";
import { useChat } from "@/context/ChatProvider";
import { useAuth } from "@/context/AuthProvider";
import { getMessageByUserId } from "@/api/message";
import { getUserGroups } from "@/api/user";
import { User } from "@/dto/User";

function isGroup(chat: ChatTarget): chat is Group {
  return (
    (chat as Group).participants !== undefined &&
    (chat as Group).participants !== null
  );
}

export default function Chat() {
  const { user, setActiveUsers, activeUsers, sendMessage, onMessage, socket } =
    useChat();
  const auth = useAuth();
  const [messages, setMessages] = useState<{ [chatId: string]: MessageDTO[] }>(
    {}
  );
  const [selectedChat, setSelectedChat] = useState<ChatTarget | null>(null);
  const [message, setMessage] = useState("");
  const [view, setView] = useState<"friends" | "groups">("friends");
  const [groups, setGroups] = useState<Group[]>([]);
  const [repliedMessage, setRepliedMessage] = useState<MessageDTO | null>(null);

  const fetchGroups = async (userId: string) => {
    const response = await getUserGroups(userId);
    if (!Array.isArray(response)) return;
    const transformedGroups: Group[] = response.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ({ _id, name, participants }: any) => ({
        id: _id,
        name,
        participants: participants.map((participant: User) => ({
          id: participant._id,
          username: participant.username,
        })),
      })
    );

    setGroups(transformedGroups);
  };
  useEffect(() => {
    if (!socket) return;

    const handleActiveUsers = (users: User[]) => {
      console.log("Active users updated:", users);
      setActiveUsers(users);
    };

    socket.on("activeUsers", handleActiveUsers);

    return () => {
      socket.off("activeUsers", handleActiveUsers);
    };
  }, [socket, setActiveUsers]);

  useEffect(() => {
    if (!socket || !user?.id) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleGroupUpdated = async (data: any) => {
      console.log("group updated", data);
      const response = await getUserGroups(user.id);
      if (!Array.isArray(response)) return;

      const transformedGroups: Group[] = response.map(
        ({ _id, name, participants }: Group) => ({
          id: _id ?? "",
          name,
          participants: participants.map((participant: User) => ({
            id: participant._id ?? "",
            username: participant.username,
          })),
        })
      );
      setGroups(transformedGroups);
      // 🔄 Reset selectedChat if it matches the updated group
      if (selectedChat && isGroup(selectedChat)) {
        const updatedGroup = transformedGroups.find(
          (g) => g.id === selectedChat.id
        );
        if (updatedGroup) {
          setSelectedChat(updatedGroup);
        }
      }
    };

    socket.on("groupUpdated", handleGroupUpdated);
    return () => {
      socket.off("groupUpdated", handleGroupUpdated);
    };
  }, [socket, user?.id, selectedChat]);

  useEffect(() => {
    if (!socket) return;
    const handleDeletedMessage = (messageId: string) => {
      console.log("message delete", messageId);
      setMessages((prev) => {
        const updated = { ...prev };
        for (const chatId in updated) {
          updated[chatId] = updated[chatId].filter(
            (msg) => msg.id !== messageId
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
  }, [user?.id]);

  useEffect(() => {
    if (socket && user?.id) {
      socket.off("groupCreated");

      socket.on("groupCreated", (data) => {
        console.log("Group created event received:", data);

        if (user?.id && data.group.participants.includes(user?.id)) {
          console.log("Fetching groups for user:", user?.id);
          fetchGroups(user?.id);
        }
      });

      return () => {
        socket.off("groupCreated");
      };
    }
  }, [socket, user?.id]);

  useEffect(() => {
    const unsubscribe = onMessage((msg) => {
      const isSender = msg.sender.id === user?.id;
      console.log("message received :", msg, activeUsers);
      // 🛑 Avoid adding duplicate if user already added it optimistically
      // if (msg.group && !isSender) return;

      setMessages((prev) => {
        const chatId =
          msg.group?.id ?? (isSender ? msg.receiver?.id : msg.sender.id);
        if (!chatId) return prev;

        const chatContent = prev[chatId] || [];

        // Extra protection from duplicate ID
        const alreadyExists = chatContent.some((m) => m.id === msg.id);
        if (alreadyExists) return prev;

        return {
          ...prev,
          [chatId]: [...chatContent, msg],
        };
      });
    });

    return () => unsubscribe();
  }, [onMessage, user?.id, socket]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedChat || message.trim() === "" || !user) return;
    const messageData: MessageDTO = {
      id: crypto.randomUUID(),
      sender: user,
      content: message,
      timestamp: new Date(),
      repliedMessage: repliedMessage ?? undefined,
    };
    console.log(messageData);

    if (isGroup(selectedChat)) {
      const fullGroup = groups.find((g) => g.id === selectedChat.id);

      if (fullGroup && fullGroup.participants?.length) {
        const enrichedParticipants = fullGroup.participants.map(
          (participant) => {
            const active = activeUsers.find((u) => u.id === participant.id);
            return active ?? participant;
          }
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
    setRepliedMessage(null);
  };
  useEffect(() => {
    if (!socket) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMessageConfirmed = ({ tempId, msgData }: any) => {
      setMessages((prev) => {
        const updated = { ...prev };
        for (const chatId in updated) {
          console.log(tempId, msgData);
          updated[chatId] = updated[chatId].map((msg) =>
            msg.id === tempId ? msgData : msg
          );
        }
        return updated;
      });
    };

    socket.on("messageConfirmed", handleMessageConfirmed);

    return () => {
      socket.off("messageConfirmed", handleMessageConfirmed);
    };
  }, [socket]);

  useEffect(() => {
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
                  id: m?._id ?? "",
                  sender: {
                    ...m.sender,
                    id: m?.sender?._id ?? "",
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
              {}
            );

          setMessages(transformedMessages);
        } catch (err) {
          console.error("Failed to fetch messages:", err);
        }
      }
    };

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
          repliedMessage={repliedMessage}
          setRepliedMessage={setRepliedMessage}
        />
      </div>
    </div>
  );
}
