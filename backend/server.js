import dotenv from "dotenv";
import mongoose from "mongoose";
import { Server } from "socket.io";
import http from "http";
import app from "./app.js";
import { v4 as uuidv4 } from "uuid";
import session from "express-session";

dotenv.config({ path: "config.env" });

const PORT = process.env.PORT || 5000;
const DB_URI = process.env.MONGODB_URI;

// DB connection
mongoose
  .connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ DB Connected"))
  .catch((err) => console.error("❌ DB Error", err));

// Wrap Express in HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  socket.on("create-room", () => {
    const roomId = uuidv4();
    socket.join(roomId);
    console.log(`📺 Room ${roomId} created by ${socket.id}`);
    socket.emit("room-created", { roomId });
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
