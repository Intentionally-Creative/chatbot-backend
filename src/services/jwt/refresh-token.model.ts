import { Schema, model } from "mongoose";

export interface IRefreshToken {
  user: Schema.Types.ObjectId;
  token: string;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const RefreshToken = model("RefreshToken", refreshTokenSchema);
export default RefreshToken;
