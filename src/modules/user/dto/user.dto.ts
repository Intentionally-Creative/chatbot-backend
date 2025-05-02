import { z } from "zod";

export const userValidationSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().trim().min(5),
});

export const editUserValidationSchema = userValidationSchema.extend({
  password: z.string().trim().min(5).optional().or(z.undefined()),
});

export const editMyDetailsValidationSchema = z.object({
  email: z.string().email().trim(),
});

export type UserDto = z.infer<typeof userValidationSchema>;
export type EditUserDto = z.infer<typeof editUserValidationSchema>;
export type EditMyDetailsDto = z.infer<typeof editMyDetailsValidationSchema>;
