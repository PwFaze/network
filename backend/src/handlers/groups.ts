import { Request, Response } from "express";
import { Group } from "../models/Groups";
import { UserDTO } from "../dto/UserDTO";
import { User } from "../models/Users";
import { Server, Socket } from "socket.io";
import mongoose from "mongoose";

export const createGroup =
  (io: Server) => async (req: Request, res: Response) => {
    try {
      const { name, participants } = req.body;

      if (!name || !participants || participants.length === 0) {
        return res.status(400).json({
          success: false,
          msg: "Please provide a group name and participants",
        });
      }

      const group = await Group.create({
        participants,
        name: name,
      });

      console.log("Created group:", group);

      // Broadcast to all connected clients
      io.emit("groupCreated", { group });

      res.status(201).json({ success: true, group });
    } catch (err: unknown) {
      res.status(400).json({ success: false });
      if (err instanceof Error) {
        console.log(err.stack);
      }
    }
  };

export const getGroups = async (req: Request, res: Response) => {
  // console.log(req.headers);
  // const allGroups = await Group.find({});
  // console.log("allGroups", allGroups);
  try {
    const userId = req.params.user?.toString(); // Ensure userId is a string
    if (!userId) {
      return res.status(401).json({ success: false, msg: "Unauthorized" });
    }
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, msg: "Invalid user ID" });
    }
    if (!userId) {
      return res.status(401).json({ success: false, msg: "Unauthorized" });
    }
    const groups = await Group.find().populate("participants");

    res.status(200).json({ success: true, groups });
  } catch (err: unknown) {
    res.status(400).json({ success: false });
    if (err instanceof Error) {
      console.log(err.stack);
    }
  }
};

export const leaveGroup = (io: Server) => {
  return async (req: Request, res: Response) => {
    try {
      const { groupId, userId } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(groupId) ||
        !mongoose.Types.ObjectId.isValid(userId)
      ) {
        return res
          .status(400)
          .json({ success: false, msg: "Invalid groupId or userId" });
      }

      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ success: false, msg: "Group not found" });
      }

      if (!group.participants.some((id) => id.toString() === userId)) {
        return res
          .status(400)
          .json({ success: false, msg: "User is not in the group" });
      }

      group.participants.pull(userId);
      await group.save();

      io.emit("groupUpdated", { groupId, type: "leave", userId });

      return res
        .status(200)
        .json({ success: true, msg: "User left the group", group });
    } catch (error) {
      console.error("Leave group error:", error);
      return res.status(500).json({ success: false, msg: "Server error" });
    }
  };
};

export const leaveGroupSocket = (io: Server, socket: Socket) => {
  socket.on("leaveGroup", async ({ groupId, userId }) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(groupId) ||
        !mongoose.Types.ObjectId.isValid(userId)
      ) {
        return socket.emit("error", {
          type: "leaveGroup",
          msg: "Invalid groupId or userId",
        });
      }

      const group = await Group.findById(groupId);
      if (!group) {
        return socket.emit("error", {
          type: "leaveGroup",
          msg: "Group not found",
        });
      }

      if (!group.participants.some((id) => id.toString() === userId)) {
        return socket.emit("error", {
          type: "leaveGroup",
          msg: "User is not in the group",
        });
      }

      group.participants.pull(userId);
      await group.save();

      io.emit("groupUpdated", {
        groupId,
        type: "leave",
        userId,
      });

      socket.emit("leftGroup", {
        success: true,
        msg: "User left the group",
        group,
      });
    } catch (error) {
      console.error("Leave group error:", error);
      socket.emit("error", {
        type: "leaveGroup",
        msg: "Server error",
      });
    }
  });
};

export const joinGroupSocket = (io: Server, socket: Socket) => {
  socket.on("joinGroup", async ({ userId, groupId }) => {
    try {
      const group = await Group.findById(groupId).populate("participants");
      if (!group) {
        return socket.emit("error", "Group not found");
      }

      const isAlreadyInGroup = group.participants.some((p) => p.id === userId);

      if (!isAlreadyInGroup) {
        group.participants.push(userId);
        await group.save();
      }

      io.emit("groupUpdated", { groupId });
    } catch (err) {
      console.error("Join group error:", err);
      socket.emit("error", "Failed to join group");
    }
  });
};
