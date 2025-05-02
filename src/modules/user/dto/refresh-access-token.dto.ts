import { z } from "zod";

export const refreshAccessTokenValidation = z.object({
  refreshToken: z.string(),
});

export type RefreshAccessTokenDto = z.infer<
  typeof refreshAccessTokenValidation
>;
