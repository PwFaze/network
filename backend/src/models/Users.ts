import { Schema, Types, model } from "mongoose";
import type { InferSchemaType } from "mongoose";

const UserSchema = new Schema({
  username: String,
  password: String,
  createdAt: Date,
  updatedAt: Date,
});
type UserType = InferSchemaType<typeof UserSchema>;
export const User = model("User", UserSchema);
export { UserType };
