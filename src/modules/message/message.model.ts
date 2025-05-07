import mongoose from "mongoose";

interface IMessage {
  sessionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  role: "user" | "assistant";
  metadata?: {
    type: string;
    transcribedText?: string;
  };
}

const MessageSchema = new mongoose.Schema<IMessage>(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    metadata: {
      type: {
        type: String,
        enum: ["audio"],
      },
      transcribedText: String,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model<IMessage>("Message", MessageSchema);
export default Message;
