import mongoose from "mongoose";
import { hashPassword } from "../../lib/password-utils.js";

export const userRoles = ["user", "admin"] as const;
export type UserRole = (typeof userRoles)[number];

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: userRoles,
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await hashPassword(this.password.trim());
  }
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
