import express from "express";

import dotenv from "dotenv";
import {
  googleLogin,
  googleCallback,
  googleYTData,
  googleFeedData,
  getVideoStats,
  googleLikedVideos,
  googleSavedVideos,
  googleTrendingVideos,
} from "../controllers/authController.js";

dotenv.config();

const router = express.Router();

router.get("/google", googleLogin);
router.get("/callback", googleCallback);
router.get("/youtube-data", googleYTData);
router.get("/feed", googleFeedData);
router.get("/video/:id", getVideoStats);
router.get("/liked", googleLikedVideos);
router.get("/saved", googleSavedVideos);
router.get("/trending", googleTrendingVideos);
router.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }
  const { name, email, picture } = req.session.user;
  res.json({ name, email, picture });
});

export default router;
