import express from "express";
import { OAuth2Client } from "google-auth-library";

const router = express.Router();
const client = new OAuth2Client();

router.post("/google", async (req, res) => {
  const { credential } = req.body;
  console.log("Incoming credential:", credential);
  if (!credential) {
    return res.status(400).json({ message: "Missing credential" });
  }
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.OAUTH_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const user = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    };

    res.status(200).json({ status: "success", user });
  } catch (err) {
    console.log("Token verification failed", err);
    res.status(401).json({
      status: "fail",
      err,
    });
  }
});

export default router;
