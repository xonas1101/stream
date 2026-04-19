# Streamu - Developer Handoff Document

This document is designed to give any AI agent or developer a comprehensive and immediate understanding of the "Streamu" repository. Read this file securely when jumping into the project.

## 📌 Project Overview
**Streamu** is a real-time web application where users can watch YouTube videos synchronously in private rooms, chat with each other, and explore YouTube content. 
The application relies heavily on Google OAuth for authentication, the YouTube Data API to source content, and Socket.IO for real-time synchronization of state and messaging.

## 🛠 Tech Stack
### Backend
- **Node.js + Express**: Core backend framework (`/backend/app.js` and `/backend/server.js`).
- **Socket.IO**: Real-time bidirectional event-based communication (Rooms, chat, video sync).
- **Googleapis**: Powers Google OAuth2 login and YouTube Data API fetching.
- **Express-Session**: Used to track user session states (using in-memory store currently).
- **Mongoose**: Dependency exists and a lightweight schema is defined (`userModel.js`), but **no DB connection is currently active**.

### Frontend
- **React (v19) + Vite**: Frontend UI and heavy lifting.
- **Tailwind CSS**: Utility-first styling (`index.css`, `tailwind.config.js`).
- **React Router (v7)**: Client-side routing.
- **React-YouTube**: Embedded YouTube player.
- **Socket.io-client**: Connects to the backend WebSocket server (`SocketContext.jsx`).
- **GSAP & OGL**: Installed for animations and WebGL interactions globally (e.g., `MarioFollower.jsx` or general UI polish).

---

## 📁 Repository Structure

### `/backend`
* **`server.js`**: The HTTP and Socket.IO server entry point. Defines socket events (`connection`, `create-room`, `join-room`, `send-message`, `select-video`, `video-control`). Handles the core real-time room & sync logic.
* **`app.js`**: Pure Express application setup. Includes CORS, Morgan logging, session middleware mapping, and mounts API routes.
* **`routes/auth.js`**: Registers routes for Google authentication and proxy endpoints for fetching YouTube data (`/youtube-data`, `/feed`, `/video/:id`, `/liked`, etc.).
* **`controllers/authController.js`**: Implements Google OAuth consent screen redirects, callback token exchanges, and fetching data from Google APIs (`googleapis`).
* **`models/userModel.js`**: A basic Mongoose `User` schema (Name, Email, Image). *Note: Not currently wired up to a database instance.*

### `/frontend/src`
* **`App.jsx`**: Main application setup containing configured `react-router-dom` routes. Contains protected/unprotected route mapping.
* **`pages/`**:
  * `Landing.jsx` / `Home.jsx` / `RoomPage.jsx` / `Video.jsx` / `SearchResultsPage.jsx` / `Trending.jsx` / `UserPage.jsx`
* **`components/`**: Reusable parts of the layout, including `ProtectedRoutes.jsx`, `ChatInput.jsx`, `VideoGrid.jsx`, `Sidebar.jsx`, `Navbar.jsx`.
* **`context/socketContext.jsx`**: A React context that delays Socket.IO connection until a user session is confirmed via the `/api/me` backend endpoint.
* **`utils/api.js`**, **`utils/YouTubeSearch.js`**: Axios wrappers mapping to the native YouTube v3 APIs (using `VITE_GOOGLE_API_KEY`) and the backend.

---

## 🔑 Key Workflows

### 1. Authentication
1. User clicks login → `backend/controllers/authController.js` creates a Google OAuth2 URL and redirects prompt.
2. User authenticates → Google callbacks to `/auth/callback` on backend.
3. Backend retrieves user info, saves securely in `req.session.user`.
4. Frontend `SocketContext` checks `http://localhost:5001/api/me`. If valid, it mounts the socket connection.

### 2. Room & Co-watching Sync
1. An authenticated user creates a room: `socket.emit("create-room")`.
2. A random UUID is generated; the caller becomes the "room leader."
3. Invitees hit `/room/:roomId` and join: `socket.emit("join-room")`.
4. Only the Room Leader is authorized to change the video (`socket.emit("select-video")`).
5. Real-time commands like play, pause, or seeking are transmitted using `video-control` socket events.

### 3. Real-Time Chat
Room members use a text input to `socket.emit("send-message")`. The backend broadcasts to the room via `io.to(roomId).emit("receive-message")`.

---

## 🚧 Known Incompletes / Next Steps (WIP)
If you are prompted to work on this repository, please check whether these systems need to be completed first:
1. **Database Integration**: `mongoose` is installed but `mongoose.connect(...)` is missing from `server.js` or `app.js`. User sessions currently vanish if the server restarts (MemoryStore), and user profiles are not saved persistently.
2. **Session Store**: Currently uses standard `express-session` memory store. Needs upgrading to Redis or MongoDB (`connect-mongo`) for session persistence across server restarts.
3. **Environment Variables**: Make sure `OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET`, session secret, and `VITE_GOOGLE_API_KEY` are safely managed in a `.env`/`config.env`.

*Note for Agents: Use standard ES modules for updates, conform to Tailwind classes inside React files, and use the `socket` object provided by `useSocket` for any new real-time features.*