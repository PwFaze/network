import { Request, Response } from "express";
import { Chat } from "../models/Groups";
import { Server } from "socket.io";

export const createGroup = (io: Server) => async (req: Request, res: Response) => {
    try {
      const { name, participants } = req.body;
  
      if (!name || !participants || participants.length === 0) {
        return res.status(400).json({ success: false, msg: "Please provide a group name and participants" });
      }
  
      const group = await Chat.create({
        participants,
        chatName: name,
      });
  
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
    // const allGroups = await Chat.find({});
    // console.log("allGroups", allGroups);
    console.log("test");
    try {
        const userId = req.query.user?.toString(); // Ensure userId is a string
        if (!userId) {
            return res.status(401).json({ success: false, msg: "Unauthorized" });
        }
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, msg: "Invalid user ID" });
        }
        if (!userId) {
            return res.status(401).json({ success: false, msg: "Unauthorized" });
        }

        const groups = await Chat.find({ participants: { $in: [userId] } }).populate("participants").exec();
        res.status(200).json({ success: true, groups });
    } catch (err: unknown) {
        res.status(400).json({ success: false });
        if (err instanceof Error) {
            console.log(err.stack);
        }
    }
}