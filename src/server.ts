loadAndValidateEnv();

import express from "express";
import process from "process";
import cors from "cors";
import { connectToDB, disconnectFromDB } from "./config/database.js";
import routes from "./config/routes.js";

import { globalErrorHandler } from "./middlewares/global-error-handler.middleware.js";
import setupSwagger from "./config/swagger.js";
import bodyParser from "body-parser";
import { notFoundMiddleware } from "./middlewares/not-found-route.middleware.js";
import { attachUserToReq } from "./middlewares/attach-user-to-req.middleware.js";

import { envVariables, loadAndValidateEnv } from "./env-config.js";

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ["https://api.liquorstorechat.com", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// global middleware that attaches user to request if (logged in)
app.use(attachUserToReq);

//check if api is running
app.get("/", (_, res) => {
  res.send("API is running");
});

app.use("/api/v1", routes);

//@ts-ignore
app.use(globalErrorHandler);

connectToDB(() => {
  app.listen(envVariables.PORT, () => {
    console.info(`Server listening on port ${envVariables.PORT}`);
  });

  setupSwagger(app);

  app.use(notFoundMiddleware);
});

// On server shutdown
process.on("SIGINT", async () => {
  await disconnectFromDB();
  console.info("Disconnected from database");
  process.exit(1);
});
