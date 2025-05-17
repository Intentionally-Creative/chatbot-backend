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
  JIRA_HOST: z.string(),
  JIRA_EMAIL: z.string().email(),
  JIRA_API_TOKEN: z.string(),
});

export const loadAndValidateEnv = () => {
  config();
  return envSchema.parse(process.env);
};

export const envVariables = loadAndValidateEnv();
