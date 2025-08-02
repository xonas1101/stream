import express from "express";
// import { google } from "googleapis";
// import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {
  googleLogin,
  googleCallback,
  googleYTData,
  googleFeedData,
  getVideoStats,
} from "../controllers/authController.js";

dotenv.config();

const router = express.Router();

router.get("/google", googleLogin);
router.get("/callback", googleCallback);
router.get("/youtube-data", googleYTData);
router.get("/feed", googleFeedData);
router.get("/video/:id", getVideoStats);

export default router;
