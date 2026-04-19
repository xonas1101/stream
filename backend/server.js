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

  socket.on("join-room", (data) => {
    console.log("👉 join-room event received with data:", data);
    if (!data || !data.roomId) {
      console.log("❌ join-room called without roomId");
      return;
    }
    const { roomId } = data;
    socket.join(roomId);
    console.log(`${session.user.name} joined the room!: ${roomId}`);

    // Send leader name to the joining user
    socket.emit("room-info", {
      leaderName: roomLeaders[roomId] || null,
    });

    rooms[roomId] = rooms[roomId] || { messages: [] };

    socket.emit("room-messages", rooms[roomId].messages);

    socket.to(roomId).emit("user-joined", {
      name: session.user.name,
      pfp: session.user.picture,
      socketId: socket.id,
    });
  });

  socket.on("send-message", (data) => {
    console.log("👉 send-message event received with data:", data);
    const { roomId, text } = data;
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

    console.log(`Broadcasting receive-message to room: ${roomId}`);
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

  // WebRTC Signaling
  socket.on("webrtc-offer", ({ roomId, targetUserId, offer, senderId }) => {
    socket.to(targetUserId).emit("webrtc-offer", { offer, senderId, name: session.user.name, pfp: session.user.picture });
  });

  socket.on("webrtc-answer", ({ roomId, targetUserId, answer, senderId }) => {
    socket.to(targetUserId).emit("webrtc-answer", { answer, senderId });
  });

  socket.on("webrtc-ice-candidate", ({ roomId, targetUserId, candidate, senderId }) => {
    socket.to(targetUserId).emit("webrtc-ice-candidate", { candidate, senderId });
  });
});

const PORT = 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port: ${PORT}`);
});
