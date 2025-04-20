import { User } from "../models/Users";
import { Request, Response } from "express";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().exec();
    return res.status(200).json({ success: true, users });
  } catch (err: unknown) {
    res.status(400).json({ success: false });
    if (err instanceof Error) {
      console.log(err.stack);
    }
  }
};
