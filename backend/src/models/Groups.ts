import { Schema, model, Types } from "mongoose";
import type { InferSchemaType } from "mongoose";

const GroupSchema = new Schema(
  {
    participants: {
      type: [Types.ObjectId],
      required: true,
      description: "Array of user IDs participating in the chat",
    },
    chatName: {
      type: String,
      default: null,
      description:
        "Name of the chat if it's a group chat else it's the name of the user",
    },
  },
  { timestamps: true },
);
type GroupType = InferSchemaType<typeof GroupSchema>;

export const Chat = model("Chat", GroupSchema);
export { GroupType };
