import { Schema, Types, model } from "mongoose";
import type { InferSchemaType } from "mongoose";

const MessageSchema = new Schema({
  sender: {
    type: Types.ObjectId,
    required: true,
    description: "ID of the sender",
  },
  receiver: {
    type: Types.ObjectId,
    required: true,
    description: "ID of the receiver/group of the message",
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
  repliedMessage: {
    type: Types.ObjectId,
    ref: "Message",
    description: "ID of the message that this message is a reply to",
  },
});
type MessageType = InferSchemaType<typeof MessageSchema>;
export const Message = model("Message", MessageSchema);
export { MessageType };
