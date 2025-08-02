import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config({ path: "config.env" });

const GOOGLE_CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;

export const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  "http://localhost:5173/auth/callback"
);
