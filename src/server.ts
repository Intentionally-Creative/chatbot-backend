import { config } from "dotenv";
config(); // <-- Make sure this runs before anything else

import { envVariables, loadAndValidateEnv } from "./env-config.js";
import express from "express";
import cors from "cors";
import { connectToDB } from "./config/database.js";
import routes from "./config/routes.js";

import { globalErrorHandler } from "./middlewares/global-error-handler.middleware.js";
import setupSwagger from "./config/swagger.js";
import bodyParser from "body-parser";
import { notFoundMiddleware } from "./middlewares/not-found-route.middleware.js";
import { attachUserToReq } from "./middlewares/attach-user-to-req.middleware.js";
import { AUDIO_UPLOAD_DIR } from "./config/multer.js";

import { sendSlackMessage } from "./lib/slack.js";

// Call this after import
loadAndValidateEnv();

const app = express();

// allow cores all origins
app.use(cors({
  origin: '*',                   // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true              // Allow cookies and credentials
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// global middleware
app.use(attachUserToReq);

// base check
app.get("/", (_, res) => {
  res.send("API is running");
});

app.use("/uploads/audio", express.static(AUDIO_UPLOAD_DIR));

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
    const errorMessage = `❌ Error occurred: ${err.message}`;
    sendSlackMessage(errorMessage); // Notify Slack
    globalErrorHandler(err, req, res, next);
  }
);

// not found middleware
app.use(notFoundMiddleware);

// Connect DB and start server
connectToDB(() => {
  app.listen(envVariables.PORT, () => {
    const message = `🚀 Server is up and running on port ${envVariables.PORT}`;
    sendSlackMessage(message); // Notify Slack
    console.info(message);
  });
});
