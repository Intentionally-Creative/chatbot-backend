import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  sessionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  role: "user" | "assistant";
  metadata?: {
    type: "text" | "audio" | "image" | "file";
    transcribedText?: string;
    audioUrl?: string;
    audioFileName?: string;
  };
}

const MetadataSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["text", "audio", "image", "file"],
    },
    transcribedText: String,
    audioUrl: String,
    audioFileName: String,
  },
  { _id: false }
);

const MessageSchema = new Schema<IMessage>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    metadata: MetadataSchema,
  },
  { timestamps: true }
);

// compound index for fast scrolling
MessageSchema.index({ sessionId: 1, createdAt: 1 });

export default mongoose.model<IMessage>("Message", MessageSchema);
