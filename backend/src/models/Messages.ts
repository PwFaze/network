import { Schema, Types, model } from "mongoose";
import type { InferSchemaType } from "mongoose";

const MessageSchema = new Schema({
  sender: {
    type: Types.ObjectId,
    required: true,
    description: "ID of the sender",
  },
  chat: {
    type: [String],
    required: true,
    description: "ID of the chat",
  },
  content: {
    type: String,
    required: true,
    description: "Content of the message",
  },
  timestamp: {
    type: Date,
    required: true,
    description: "Timestamp of the message",
  },
});
type MessageType = InferSchemaType<typeof MessageSchema>;
export const Message = model("Message", MessageSchema);
export { MessageType };
