import express from "express";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import authRoutes from "./routes/auth.js";

const app = express();

// Session middleware (export to reuse in server.js)
export const sessionMiddleware = session({
  secret: "your-session-secret", // replace with env variable
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true if HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
  },
});

app.use(
  cors({
    origin: "http://localhost:5173",
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
