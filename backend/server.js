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

    rooms[roomId] = rooms[roomId] || { messages: [], videoId: null, videoState: { action: "pause", currentTime: 0 } };

    // Send leader name to the joining user
    socket.emit("room-info", {
      leaderName: roomLeaders[roomId] || null,
    });

    socket.emit("room-messages", rooms[roomId].messages);

    // If a video is already selected, let the new user know
    if (rooms[roomId].videoId) {
      socket.emit("video-selected", {
        videoId: rooms[roomId].videoId,
        leader: roomLeaders[roomId],
        isInitialSync: true // helps frontend know this is just an initial load
      });
      // also send the current playback state so they can sync up
      socket.emit("video-control", {
        action: rooms[roomId].videoState.action,
        currentTime: rooms[roomId].videoState.currentTime,
        name: roomLeaders[roomId],
      });
    }

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

    rooms[roomId] = rooms[roomId] || { messages: [], videoId: null, videoState: { action: "pause", currentTime: 0 } };
    rooms[roomId].videoId = videoId;
    rooms[roomId].videoState = { action: "pause", currentTime: 0 };

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
    rooms[roomId] = rooms[roomId] || { messages: [], videoId: null, videoState: { action: "pause", currentTime: 0 } };
    rooms[roomId].videoState = { action, currentTime };

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

  // Reaction logic from master
  socket.on("send-reaction", ({ roomId, emoji }) => {
    // Broadcast to everyone in the room (including sender)
    io.to(roomId).emit("receive-reaction", {
      emoji,
      senderId: socket.id,
      name: session.user.name,
      pfp: session.user.picture,
    });
  });
});

const PORT = 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port: ${PORT}`);
});
