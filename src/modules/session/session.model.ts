import mongoose from "mongoose";

interface ISession {
  userId: mongoose.Types.ObjectId;
  model: string;
  title: string;
  pin: boolean;
}

const SessionSchema = new mongoose.Schema<ISession>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    model: {
      type: String,
      default: "gpt-3.5-turbo",
      required: true,
    },
    title: {
      type: String,
      default: null,
    },
    pin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
); // Adds createdAt and updatedAt

const Session = mongoose.model<ISession>("Session", SessionSchema);
export default Session;
