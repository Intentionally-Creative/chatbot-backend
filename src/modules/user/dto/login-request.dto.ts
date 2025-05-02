import { z } from "zod";

export const loginRequestValidation = z.object({
  email: z.string().email(),
  password: z.string().min(5),
});

export type LoginRequestDto = z.infer<typeof loginRequestValidation>;
