import mongoose from "mongoose";

const MONGODB_URL =
  process.env.MONGODB_URL || "mongodb://root:rootpassword@localhost:3003";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URL, {
      authSource: "admin",
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};
