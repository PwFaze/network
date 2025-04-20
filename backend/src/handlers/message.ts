import { Request, Response } from "express";
import { Message } from "../models/Messages";
import { User } from "../models/Users";
import { Group } from "../models/Groups";
import { Server, Socket } from "socket.io";
import { MessageDTO } from "../dto/ChatDTO";
import { UserDTO } from "../dto/UserDTO";

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;

    const user = await User.findById(chatId);
    const group = await Group.findById(chatId);

    if ((user && group) || (!user && !group)) {
      return res.status(400).json({
        message:
          "chatId must correspond to either a User or a Group, but not both or neither.",
      });
    }

    if (user) {
      // Get direct messages
      const directMessages = await Message.find({
        $or: [{ sender: chatId }, { receiver: chatId }],
      })
        .lean()
        .sort({ timestamp: 1 })
        .populate("sender")
        .populate("receiver");

      // Get groups user is part of
      const groups = await Group.find({ participants: chatId }).lean();

      // Get messages from all those groups
      const groupMessages = await Message.find({
        receiver: { $in: groups.map((g) => g._id) },
      })
        .lean()
        .sort({ timestamp: 1 })
        .populate("sender")
        .populate("receiver");

      // Merge and filter out duplicate messages based on _id
      const uniqueMessagesMap = new Map<string, any>();
      [...directMessages, ...groupMessages].forEach((msg) => {
        uniqueMessagesMap.set(msg._id.toString(), msg);
      });

      const uniqueMessages = Array.from(uniqueMessagesMap.values()).sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );

      return res.status(200).json({ messages: uniqueMessages });
    }

    if (group) {
      const messages = await Message.find({ receiver: group._id })
        .sort({ timestamp: 1 })
        .populate("sender")
        .populate("receiver");

      return res.status(200).json({ messages });
    }

    res.status(500).json({ message: "Internal server error" });
  } catch (error: unknown) {
    res.status(500).json({ message: error });
  }
};

export const registerMessageHandler = (io: Server, socket: Socket) => {
  socket.on("deleteMessage", async ({ messageId, userId, receiver }) => {
    const message = await Message.findById(messageId);
    // console.log(messageId, userId, receiver);
    if (!message) return;

    if (message.sender.toString() !== userId) {
      return socket.emit("error", "Unauthorized delete attempt");
    }

    await Message.findByIdAndDelete(messageId);
    if (!receiver.participants) {
      io.to(receiver.socketId).emit("messageDeleted", messageId);
    } else {
      receiver.participants.forEach((participant: UserDTO) => {
        io.to(participant?.socketId ?? "").emit("messageDeleted", messageId);
      });
    }
  });
  socket.on("chat message", async (msgData: MessageDTO) => {
    try {
      const { sender, receiver, group, content } = msgData;
      // Validate sender
      const senderUser = await User.findById(sender.id);
      if (!senderUser) {
        console.log("Sender not found");
        return socket.emit("error", { message: "Sender not found" });
      }
      const userReceiver = await User.findById(receiver?.id);
      const groupReceiver = await Group.findById(group?._id);
      if (!userReceiver && !groupReceiver) {
        console.log("Receiver not found");
        return socket.emit("error", { message: "Receiver not found" });
      }

      const message = await Message.create({
        sender: sender.id,
        receiver: receiver?.id || group?._id,
        receiverModel: userReceiver ? "User" : "Group",
        content: content,
        timestamp: new Date(),
      });
      msgData.id = message._id.toString();
      if (receiver) {
        io.to(receiver?.socketId ?? "").emit("chat message", msgData);
        io.to(sender?.socketId ?? "").emit("chat message", msgData);
      }
      if (group) {
        group.participants.forEach((participant) => {
          console.log(participant);
          io.to(participant?.socketId ?? "").emit("chat message", msgData);
        });
      }
    } catch (error) {
      console.log("Error creating message:", error);
      socket.emit("error", { message: (error as Error).message });
    }
  });
};
