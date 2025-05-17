import { z } from "zod";

export const ticketSchema = z.object({
  type: z.enum(["support", "feedback"]),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

export type TTicket = z.infer<typeof ticketSchema>;
