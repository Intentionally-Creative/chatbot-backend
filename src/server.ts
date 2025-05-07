loadAndValidateEnv();

import express from "express";
import cors from "cors";
import { connectToDB } from "./config/database.js";
import routes from "./config/routes.js";

import { globalErrorHandler } from "./middlewares/global-error-handler.middleware.js";
import setupSwagger from "./config/swagger.js";
import bodyParser from "body-parser";
import { notFoundMiddleware } from "./middlewares/not-found-route.middleware.js";
import { attachUserToReq } from "./middlewares/attach-user-to-req.middleware.js";

import { envVariables, loadAndValidateEnv } from "./env-config.js";

import { config } from "dotenv";
config(); // <-- Make sure this runs before anything else

loadAndValidateEnv();

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// allow cores all origins
app.use(
  cors({
    origin: ["http://localhost:8080", "https://staging.liquorstorechat.com"],
    credentials: true,
  })
);

// global middleware
app.use(attachUserToReq);

// base check
app.get("/", (_, res) => {
  res.send("API is running");
});

// ✅ Register all routes
app.use("/api/v1", routes);

// ✅ Setup Swagger after routes
setupSwagger(app);

// error middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    globalErrorHandler(err, req, res, next);
  }
);

// not found middleware
app.use(notFoundMiddleware);

// Connect DB and start server
connectToDB(() => {
  app.listen(envVariables.PORT, () => {
    console.info(`Server listening on port ${envVariables.PORT}`);
  });
});
