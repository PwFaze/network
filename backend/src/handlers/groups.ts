import { Request, Response, NextFunction } from 'express';

import { Chat } from '../models/Groups';

export const createGroup = async (req: Request, res: Response) => { 
    console.log("createGroup", req.body);
    try {
        const { name, participants } = req.body;
        // console.log("createGroup", name, participants);
        // Check if group name already exists
        // const existingGroup = await Group.findOne({ name });
        // if (existingGroup) {
        //     return res.status(400).json({ success: false, msg: "Group name already exists" });
        // }
        if (!name || !participants) {
            return res.status(400).json({ success: false, msg: "Please provide a group name and participants" });
        }
        try {
            const group = await Chat.create({
                participants,
                chatName: name,
        });
            res.status(201).json({ success: true, group });
        } catch (err: unknown) {
            res.status(400).json({ success: false, msg: "Failed to create group" , err: err});
            if (err instanceof Error) {
            console.log(err.stack);
            }
        }
    } catch (err: unknown) {
        res.status(400).json({ success: false });
        if (err instanceof Error) {
            console.log(err.stack);
        }
    }
}