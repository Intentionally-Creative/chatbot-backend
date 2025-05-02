import { z } from "zod";

export const changePasswordValidation = z.object({
  currentPassword: z.string().trim().min(5),
  newPassword: z.string().trim().min(5),
});

export type ChangePasswordDto = z.infer<typeof changePasswordValidation>;
