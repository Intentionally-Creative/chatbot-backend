import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { envVariables } from "../env-config.js";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Support Chat API Documentation",
      version: "1.0.0",
      description: "API Documentation",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/modules/**/*.swagger.ts"], // Files containing annotations as above
};

const swaggerSpec = swaggerJSDoc(options);

function setupSwagger(app: Express) {
  if (envVariables.NODE_ENV === "development") {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.info(
      `API documentation available at http://localhost:${envVariables.PORT}/api-docs`
    );
  }
}

export default setupSwagger;
