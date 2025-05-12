import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { envVariables } from "../env-config.js";
import routes from './routes.js';

import listEndpoints from 'express-list-endpoints';
import { userRoute } from '../modules/user/user.route.js';
import { messageRoute } from '../modules/message/message.route.js';
import { sessionRoute } from '../modules/session/session.route.js';
import { transcribeRoute } from '../modules/transcribe/transcribe.route.js';
import { followupRoute } from '../modules/followup/followup.route.js';
console.log('\n📋 Available API Endpoints:');

const printEndpoints = (prefix: string, router: any) => {
  const endpoints = listEndpoints(router);
  endpoints.forEach((ep) => {
    console.log(`${prefix}${ep.path} → ${ep.methods.join(', ')}`);
  });
};




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

async function setupSwagger(app: Express) {
  if (envVariables.NODE_ENV === "development") {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.info(
      `API documentation available at http://localhost:${envVariables.PORT}/api-docs`
    );

    const { default: listEndpoints } = await import('express-list-endpoints');
    console.log("📋 Available API Endpoints:");
    console.table(listEndpoints(routes));
    printEndpoints('/api/v1/users', userRoute);
    printEndpoints('/api/v1/messages', messageRoute);
    printEndpoints('/api/v1/sessions', sessionRoute);
    printEndpoints('/api/v1/transcribe', transcribeRoute);
    printEndpoints('/api/v1/followup', followupRoute);
  }
}


export default setupSwagger;
