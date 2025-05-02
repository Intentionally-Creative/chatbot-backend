import mongoose from "mongoose";
import { envVariables } from "../env-config.js";

export const connectToDB = function connectToDB(callBack: () => void) {
  mongoose
    .connect(envVariables.DATABASE_URL, {})
    .then(() => {
      console.info(`Connected to database`);
      callBack();
    })
    .catch((error) => {
      console.error("Failed to connect to database", error);
      throw error;
    });
};

export const disconnectFromDB = async function closeConnection() {
  try {
    await mongoose.disconnect();
    console.info("Disconnected from the database");
  } catch (error) {
    console.error("Failed to disconnect from the database", error);
    throw error;
  }
};
