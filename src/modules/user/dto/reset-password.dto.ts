import { z } from "zod";

export const resetPasswordValidation = z.object({
  token: z.string().trim(),
  newPassword: z.string().trim().min(5),
});

export type ResetPasswordDto = z.infer<typeof resetPasswordValidation>;
