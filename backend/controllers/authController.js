import { google } from "googleapis";
import crypto from "crypto";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config({ path: "config.env" });

const oauth2Client = new google.auth.OAuth2(
  process.env.OAUTH_CLIENT_ID,
  process.env.OAUTH_CLIENT_SECRET,
  "http://localhost:5000/auth/callback"
);

const scopes = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "openid",
  "https://www.googleapis.com/auth/youtube.readonly",
];

export const googleLogin = (req, res) => {
  const state = crypto.randomBytes(32).toString("hex");
  req.session.state = state;

  const oauth2Client = new google.auth.OAuth2(
    process.env.OAUTH_CLIENT_ID,
    process.env.OAUTH_CLIENT_SECRET,
    "http://localhost:5000/auth/callback"
  );

  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    include_granted_scopes: true,
    state: state,
    prompt: "consent",
  });

  console.log("🔐 Redirecting to Google OAuth:", authorizationUrl);
  res.redirect(authorizationUrl);
};

export const googleCallback = async (req, res) => {
  const { code, state } = req.query;

  console.log("🔁 Google Callback Triggered");
  console.log("Received code:", code);
  console.log("Received state:", state);
  console.log("Session state:", req.session.state);

  if (!code) {
    return res.status(400).send("Missing authorization code.");
  }

  if (state !== req.session.state) {
    console.warn("⚠️ State mismatch. Possible CSRF or session loss.");
    return res.status(400).send("State mismatch. Possible CSRF attack.");
  }

  // Re-create a new OAuth client inside the function to avoid shared state
  const oauth2Client = new google.auth.OAuth2(
    process.env.OAUTH_CLIENT_ID,
    process.env.OAUTH_CLIENT_SECRET,
    "http://localhost:5000/auth/callback"
  );

  try {
    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    console.log("✅ Tokens received:", tokens);

    oauth2Client.setCredentials(tokens);

    // Use OAuth2 API to get user info
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const userInfo = await oauth2.userinfo.get();
    console.log("👤 User Info:", userInfo.data);

    // Store minimal user info in session
    req.session.user = {
      name: userInfo.data.name,
      email: userInfo.data.email,
      picture: userInfo.data.picture,
      access_token: tokens.access_token,
    };

    console.log("✅ User session set successfully");
    res.redirect("http://localhost:5173/home");
  } catch (err) {
    console.error("❌ Full error during callback:", {
      message: err.message,
      code: err.code,
      response: err.response?.data,
    });

    res.status(500).send("Authentication error. See server logs.");
  }
};

export const googleYTData = async (req, res) => {
  if (!req.session.user || !req.session.user.access_token) {
    return res.status(401).send("Not authenticated");
  }

  const oauthClient = new google.auth.OAuth2();
  oauthClient.setCredentials({ access_token: req.session.user.access_token });

  const youtube = google.youtube({ version: "v3", auth: oauthClient });

  try {
    const subscriptions = await youtube.subscriptions.list({
      part: "snippet",
      mine: true,
      maxResults: 10,
    });

    res.json(subscriptions.data);
  } catch (error) {
    console.error("YouTube API error:", error);
    res.status(500).send("Failed to fetch YouTube data");
  }
};

export const googleFeedData = async (req, res) => {
  if (!req.session.user || !req.session.user.access_token) {
    return res.status(401).send("Not authenticated");
  }

  const oauthClient = new google.auth.OAuth2();
  oauthClient.setCredentials({ access_token: req.session.user.access_token });

  const youtube = google.youtube({ version: "v3", auth: oauthClient });

  try {
    const subs = await youtube.subscriptions.list({
      part: "snippet",
      mine: true,
      maxResults: 10,
    });

    const channelIds = subs.data.items.map(
      (item) => item.snippet.resourceId.channelId
    );

    const allVideos = [];

    for (const channelId of channelIds) {
      const channelRes = await youtube.channels.list({
        part: "contentDetails,snippet",
        id: channelId,
      });

      const channelInfo = channelRes.data.items[0];
      const uploadsPlaylistId =
        channelInfo.contentDetails.relatedPlaylists.uploads;

      const videoRes = await youtube.playlistItems.list({
        part: "snippet",
        playlistId: uploadsPlaylistId,
        maxResults: 3,
      });

      const videos = videoRes.data.items.map((video) => ({
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails?.medium?.url,
        videoId: video.snippet.resourceId.videoId,
        publishedAt: video.snippet.publishedAt,
      }));

      allVideos.push({
        channelId,
        channelTitle: channelInfo.snippet.title,
        channelThumbnail: channelInfo.snippet.thumbnails?.default?.url,
        videos,
      });
    }

    res.json(allVideos);
  } catch (err) {
    console.error("Feed fetch error:", err);
    res.status(500).send("Error fetching video feed");
  }
};

export const getVideoStats = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Video ID is required" });
    }

    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos`,
      {
        params: {
          part: "snippet,statistics",
          id: id,
          key: process.env.GOOGLE_API_KEY,
        },
      }
    );

    const video = response.data.items[0];

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    const stats = {
      title: video.snippet.title,
      views: video.statistics.viewCount,
      likes: video.statistics.likeCount,
      comments: video.statistics.commentCount,
    };

    res.status(200).json(stats);
  } catch (err) {
    console.error("Error fetching video stats:", err);
    res.status(500).json({ error: "Failed to fetch video stats" });
  }
};
