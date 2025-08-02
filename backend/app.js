import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.js";
import morgan from "morgan";
import session from "express-session";
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(
  session({
    secret: "y5Hn@GfP!Dkz3Q9r#BvXp6LwM2Tf$Js8ZcEn^Ku1",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 24 },
  })
);
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/auth", authRoutes);

export default app;
