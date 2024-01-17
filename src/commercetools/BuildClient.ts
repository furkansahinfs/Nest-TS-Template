import fetch from "node-fetch";
import {
  ClientBuilder,

  // Import middlewares
  type AuthMiddlewareOptions, // Required for auth
  type HttpMiddlewareOptions, // Required for sending HTTP requests
} from "@commercetools/sdk-client-v2";

const projectKey = process.env.CT_PROJECT_KEY;
const scopes = [process.env.CT_PROJECT_SCOPES];

// Configure authMiddlewareOptions
const authMiddlewareOptions: AuthMiddlewareOptions = {
  host: process.env.CT_AUTH_URL,
  projectKey: projectKey,
  credentials: {
    clientId: process.env.CT_CLIENT_ID,
    clientSecret: process.env.CT_CLIENT_SECRET,
  },
  scopes,
  fetch,
};

// Configure httpMiddlewareOptions
const httpMiddlewareOptions: HttpMiddlewareOptions = {
  host: process.env.CT_API_URL,
  fetch,
};

// Export the ClientBuilder
export const ctpClient = new ClientBuilder()
  .withProjectKey(projectKey) // .withProjectKey() is not required if the projectKey is included in authMiddlewareOptions
  .withClientCredentialsFlow(authMiddlewareOptions)
  .withHttpMiddleware(httpMiddlewareOptions)
  .withLoggerMiddleware() // Include middleware for logging
  .build();
