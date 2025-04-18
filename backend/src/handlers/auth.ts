import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/Users';

const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
    //create token
    const token = user.getSignedJwtToken();

    const options: { expires: Date; httpOnly: boolean; secure?: boolean } = {
    expires: new Date(
        Date.now() + (Number(process.env.JWT_COOKIE_EXPIRE) || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    };

    if (process.env.NODE_ENV === "production") {
    options.secure = true;
    }

    res
    .status(statusCode)
    // .cookie("token", token, options)
    .json({ success: true, _id:user._id, name: user.name, token });
};

export const register = async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
    //   console.log("register", username, password); 

      // Check if username already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ success: false, msg: "Username already exists" });
      }

      const user = await User.create({
          username,
          password,
      });
      
      sendTokenResponse(user, 200, res);
    } catch (err: unknown) {
      res.status(400).json({ success: false });
      if (err instanceof Error) {
        console.log(err.stack);
      }
    }
  };

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
    const { username, password } = req.body;
    // console.log("login", username, password);
  //validate
    if ( !username || !password) {
      return res
        .status(400)
        .json({ success: false, msg: "Please provide an username and password" });
    }
  //check for user
    const user = await User.findOne({ username }).select("+password");
  
    if (!user) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid credentials" });
    }
  
  //check if password match
    if (!user.password) {
      return res.status(401).json({ success: false, msg: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
  
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid credentials" });
    }
  
      sendTokenResponse(user, 200, res);
    } catch (err) {
      res.status(401).json({ success: false, msg: "Cannot convert username or password to string" });
    }
  };