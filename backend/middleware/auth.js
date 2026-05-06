import { auth } from "express-openid-connect";
import dotenv from "dotenv";

dotenv.config();

// Auth0 configuration
const config = {
  authRequired: false,      // Allow public routes
  auth0Logout: true,        // Use Auth0 logout endpoint
  secret: process.env.SECRET,
  baseURL: process.env.BASEURL,
  clientID: process.env.CLIENTID,
  issuerBaseURL: process.env.ISSUER
};

export const authMiddleware = auth(config);
