import mongoose from "mongoose";

export const userRoles = ["user", "admin"] as const;
export type UserRole = (typeof userRoles)[number];

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  storeName: string;
  liquorAddress: {
    country: string;
    city: string;
    state: string;
    lng: number | null;
    lat: number | null;
    zipCode: string;
    link: string;
    formattedAddress: string;
    extras: any[];
  };
  summary: {
    type: String;
    default: "";
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
      required: true,
    },

    storeName: { type: String, required: true },
    liquorAddress: {
      country: { type: String },
      city: { type: String },
      state: { type: String },
      lng: { type: Number, default: null },
      lat: { type: Number, default: null },
      zipCode: { type: String },
      link: { type: String },
      formattedAddress: { type: String },
      extras: [],
    },
    summary: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
