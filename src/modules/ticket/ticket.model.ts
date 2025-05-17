import mongoose, { Schema, Document } from "mongoose";

export type TicketType = "support" | "feedback";
export type TicketStatus = "open" | "in-progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high";

export interface ITicket extends Document {
  userId: mongoose.Types.ObjectId;
  type: TicketType;
  subject: string;
  message: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  jiraIssueId?: string;
  jiraIssueUrl?: string;
}

const TicketSchema = new Schema<ITicket>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["support", "feedback"],
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedAt: {
      type: Date,
    },
    jiraIssueId: {
      type: String,
    },
    jiraIssueUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
TicketSchema.index({ userId: 1, createdAt: -1 });
TicketSchema.index({ type: 1, status: 1 });
TicketSchema.index({ status: 1, priority: 1 });

export default mongoose.model<ITicket>("Ticket", TicketSchema);
