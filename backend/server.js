import http from "http";
import { Server } from "socket.io";
import app, { sessionMiddleware } from "./app.js";
import session from "express-session";
import crypto from "crypto";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.engine.use(sessionMiddleware);
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

// Store leader name for each room
const roomLeaders = {};
const rooms = {};

io.on("connection", (socket) => {
  const session = socket.request.session;

  if (!session?.user) {
    console.log("❌ Unauthorized socket connection");
    return socket.disconnect();
  }

  console.log("✅ User connected:", session.user.name);
  console.log("User picture:", session.user.picture);

  socket.on("create-room", () => {
    const roomId = crypto.randomUUID();
    const inviteLink = `http://localhost:5173/room/${roomId}`;

    // Save leader for the room
    roomLeaders[roomId] = session.user.name;

    socket.emit("room-created", {
      roomId,
      inviteLink,
      leaderName: session.user.name,
    });
  });

  socket.on("join-room", ({ roomId }) => {
    socket.join(roomId);
    console.log(`${session.user.name} joined the room!`);

    // Send leader name to the joining user
    socket.emit("room-info", {
      leaderName: roomLeaders[roomId] || null,
    });

    rooms[roomId] = rooms[roomId] || { messages: [] };

    socket.emit("room-messages", rooms[roomId].messages);

    socket.to(roomId).emit("user-joined", {
      name: session.user.name,
      pfp: session.user.picture,
    });
  });

  socket.on("send-message", ({ roomId, text }) => {
    const user = session.user;
    const msg = {
      text,
      name: user.name,
      pfp: user.picture,
      senderId: socket.id,
      time: Date.now(),
    };

    rooms[roomId] = rooms[roomId] || { messages: [] };
    rooms[roomId].messages.push(msg);

    io.to(roomId).emit("receive-message", msg);
  });

  socket.on("select-video", ({ roomId, videoId }) => {
    console.log("select-video received from", session.user.name, {
      roomId,
      videoId,
    });

    if (roomLeaders[roomId] !== session.user.name) {
      return socket.emit("error", {
        message: "Not authorized to select video",
      });
    }
    io.to(roomId).emit("video-selected", {
      videoId,
      leader: session.user.name,
    });
  });

  socket.on("leader-choosing-video", ({ roomId }) => {
    socket.to(roomId).emit("leader-choosing-video", {
      leader: session.user.name,
    });
  });

  socket.on("video-control", ({ roomId, action, currentTime }) => {
    socket.to(roomId).emit("video-control", {
      action,
      currentTime,
      name: session.user.name,
    });
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
