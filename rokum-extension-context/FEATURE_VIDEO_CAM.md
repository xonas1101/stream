# Feature Documentation: WebRTC Video/Audio Camera Integration

**Branch Context:** `feature/video-integration`
**Purpose:** This document provides context for other active development branches to avoid merge conflicts while the WebRTC-based camera feature is being implemented.

## 🚀 Feature Overview
Adding a peer-to-peer WebRTC video and audio feature inside the shared viewing room. This allows room participants to see and hear each other while watching the YouTube stream.

## 🏗️ Technical Architecture
- **WebRTC Mesh Network:** Direct peer-to-peer connections between all users in a room.
- **Signaling:** The existing `Socket.io` backend will act as the signaling server to exchange session descriptions (Offers/Answers) and ICE candidates.

---

## 📁 File Manifest & Impact Analysis

### 🟢 1. Completely New Files (No Merge Conflict Risk)
The following files are being created specifically for this feature and will not interfere with other branches:
* `/frontend/src/hooks/useWebRTC.js`: Custom React hook to manage WebRTC state, `RTCPeerConnection` instances, and media permissions.
* `/frontend/src/components/CamGrid.jsx`: UI component to map and layout the video streams.
* `/frontend/src/components/CamStream.jsx`: React wrapper component to correctly bind `MediaStream` objects to HTML `<video>` tags.

### 🟡 2. Modified Files (Potential Merge Conflict Areas)
If your feature also heavily modifies these files, please coordinate or merge carefully. Changes here have been kept deliberately tiny (surgical additions).

**`backend/server.js`**
* **What's changing:** Adding new socket listener events *inside* the existing `io.on("connection")` closure.
* **Events added:** `webrtc-offer`, `webrtc-answer`, `webrtc-ice-candidate`.
* **Impact limit:** We are strictly appending to the end of the connection block. No existing socket events (`send-message`, `select-video`, etc.) are being altered.

**`frontend/src/pages/RoomPage.jsx`**
* **What's changing:** 
  1. Importing and executing `const { localStream, remoteStreams } = useWebRTC(roomId);`
  2. Dropping the `<CamGrid />` component into the existing responsive layout.
* **Impact limit:** Modifying the JSX return slightly. If you are doing layout overhauls in `RoomPage.jsx`, please note that an aside/grid container for camera videos will be introduced here.

---

## 🤝 Coordination Guidelines for Other Branches
1. **Socket Events in `server.js`:** You can freely add your own socket events. Just append them; we won't touch yours if you don't touch ours.
2. **`RoomPage` Layout:** If you are adding features to the Room layout (like a new sidebar or chat upgrades), wrap your features in their own components. We are doing the same with `<CamGrid />` to ensure our imports don't collide.
3. **Dependencies:** No new `npm` packages are needed for this phase. Native `navigator.mediaDevices` and `RTCPeerConnection` are being used.

---
*Generated prior to implementation to assist parallel workspace synchronization.*