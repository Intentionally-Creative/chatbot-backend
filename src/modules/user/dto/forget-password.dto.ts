import { z } from "zod";

export const forgetPasswordValidation = z.object({
  email: z.string().email().trim().toLowerCase(),
});

export type ForgetPasswordDto = z.infer<typeof forgetPasswordValidation>;
