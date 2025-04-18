import { Schema, Types, model } from "mongoose";
import type { InferSchemaType } from "mongoose";

const UserSchema = new Schema({
  username: String,
  password: String,
  groupIds: {
    type: [Types.ObjectId],
    ref: "Chat",
    description: "Array of group IDs the user is participating in",
  },
});
type UserType = InferSchemaType<typeof UserSchema>;
export const User = model("User", UserSchema);
export { UserType };
