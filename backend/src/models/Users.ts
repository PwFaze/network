import { Schema, Types, model } from "mongoose";
import type { InferSchemaType } from "mongoose";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  groupIds: {
    type: [Types.ObjectId],
    ref: "Group",
    description: "Array of group IDs the user is participating in",
  },
});

UserSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(10);
  if (this.password) {
    this.password = await bcrypt.hash(this.password, salt);
  }
});

UserSchema.methods.getSignedJwtToken = function () {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jsonwebtoken.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: parseInt(process.env.JWT_EXPIRE || "0", 10),
  });
};

UserSchema.methods.matchPassword = async function (enteredPassword: any) {
  return await bcrypt.compare(enteredPassword, this.password);
};

type UserType = InferSchemaType<typeof UserSchema>;
export const User = model("User", UserSchema);
export { UserType };
