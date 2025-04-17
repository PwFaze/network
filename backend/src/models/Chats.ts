import { Schema, model, Types } from "mongoose";
import type { InferSchemaType } from "mongoose";

const ChatSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["user", "group"],
      required: true,
    },
    participants: {
      type: [Types.ObjectId],
      required: true,
    },
    chatName: {
      type: String,
      default: null,
      description:
        "Name of the chat if it's a group chat else it's the name of the user",
    },
    lastMessage: {
      type: String,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);
type ChatType = InferSchemaType<typeof ChatSchema>;

export const Chat = model("Chat", ChatSchema);
export { ChatType };
