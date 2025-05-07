import mongoose from "mongoose";
import { hashPassword } from "../../lib/password-utils.js";

export const userRoles = ["user", "admin"] as const;
export type UserRole = (typeof userRoles)[number];

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  liquorName: string;
  liquorAddress: {
    country: string;
    city: string;
    state: string;
    postalCode: string;
  };
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
    name: {
       type: String, 
       required: true 
      },

    liquorName: { type: String, required: true },
    liquorAddress: {
      country: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
    },
  },
  {
    timestamps: true,
  }
);



const User = mongoose.model("User", userSchema);
export default User;
