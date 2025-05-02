import "dotenv/config";

export const envVariables = {
  NODE_ENV: process.env.NODE_ENV! as "development" | "production",
  PORT: process.env.PORT || 8000,
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
};

// Get all keys into an array
const requiredEnvVars = Object.keys(envVariables);

export function loadAndValidateEnv() {
  const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }

  console.info("All required environment variables are set.");
}
