import { z } from "zod";
import { config } from "dotenv";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  PORT: z.string().transform(Number),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  SLACK_WEBHOOK_URL: z.string(),
  OPENAI_API_KEY: z.string(),
  API_BASE_URL: z.string(),
  JIRA_HOST: z
    .string()
    .optional()
    .refine(
      (val) => process.env.NODE_ENV !== "production" || val !== undefined,
      { message: "JIRA_HOST is required in production mode" }
    ),
  JIRA_EMAIL: z
    .string()
    .email()
    .optional()
    .refine(
      (val) => process.env.NODE_ENV !== "production" || val !== undefined,
      { message: "JIRA_EMAIL is required in production mode" }
    ),
  JIRA_API_TOKEN: z
    .string()
    .optional()
    .refine(
      (val) => process.env.NODE_ENV !== "production" || val !== undefined,
      { message: "JIRA_API_TOKEN is required in production mode" }
    ),
});

export const loadAndValidateEnv = () => {
  config();
  return envSchema.parse(process.env);
};

export const envVariables = loadAndValidateEnv();
