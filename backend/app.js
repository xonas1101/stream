import express from "express";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import sessionFileStore from "session-file-store";
import authRoutes from "./routes/auth.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.set("trust proxy", 1); // Required for secure cookies behind proxies like Render
const FileStore = sessionFileStore(session);

// Session middleware (export to reuse in server.js)
export const sessionMiddleware = session({
  store: new FileStore({ path: "./sessions", retries: 0 }),
  secret: process.env.SESSION_SECRET || "your-session-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production", // true if deployed
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // must be 'none' for cross-domain setup
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
  },
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(sessionMiddleware);
app.use(express.json());
app.use(morgan("dev"));

// Test route
app.get("/", (req, res) => {
  res.send("API running...");
});

app.get("/api/me", (req, res) => {
  if (req.session.user) {
    const { access_token, ...safeUser } = req.session.user;
    res.status(200).json(safeUser);
  } else {
    res.status(401).json({ error: "Not logged in" });
  }
});
app.use("/auth", authRoutes);

export default app;
