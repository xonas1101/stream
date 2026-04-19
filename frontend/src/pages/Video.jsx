import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useSocket } from "../context/socketContext";
import { toast } from "react-toastify";
import YouTube from "react-youtube";
import ChatInput from "../components/ChatInput";
import ReactionBar from "../components/ReactionBar";
import ReactionBubbles from "../components/ReactionBubbles";
import { useWebRTC } from "../context/WebRTCContext";
import { CamGrid } from "../components/CamGrid";

function Video() {
  const { id: videoId } = useParams();
  const { state, search } = useLocation();
  const socket = useSocket();
  const [video, setVideo] = useState(null);
  const {
    localStream,
    remoteStreams,
    toggleAudio,
    toggleVideo,
    isAudioMuted,
    isVideoMuted,
    isVCEnabled,
    stopVC,
  } = useWebRTC();

  const roomId = state?.roomId ?? new URLSearchParams(search).get("roomId");

  const playerRef = useRef(null);
  const ignoreNextStateChange = useRef(false);
  const expectedState = useRef(null);
  const toastTimeout = useRef(null); // prevent spam toasts
  const pendingInitialSync = useRef(null); // hold state if player not ready

  const [messages, setMessages] = useState([]);
  const messageEndRef = useRef(null);
  const navigate = useNavigate();

  // ── Resizable sidebar ──────────────────────────────────────────
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const isDragging = useRef(false);

  const startResize = (e) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMove = (moveEvent) => {
      if (!isDragging.current) return;
      const clientX = moveEvent.clientX ?? moveEvent.touches?.[0]?.clientX;
      const newWidth = window.innerWidth - clientX;
      setSidebarWidth(Math.min(600, Math.max(240, newWidth)));
    };

    const onUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  };

  useEffect(() => {
    if (!socket || !roomId) {
      console.log("No socket or roomId in Video", { socket: !!socket, roomId });
      return;
    }
    
    const handleJoin = () => {
      console.log("Video Page: Emitting join-room for roomId:", roomId);
      socket.emit("join-room", { roomId });
    };

    socket.on("connect", handleJoin);
    if (socket.connected) {
      handleJoin();
    }

    socket.on("room-messages", (msgs) => {
      console.log("Video page received room-messages:", msgs);
      setMessages(msgs || []);
    });
    
    socket.on("receive-message", (msg) => {
      console.log("Video page received message:", msg);
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("connect", handleJoin);
      socket.off("room-messages");
      socket.off("receive-message");
    };
  }, [socket, roomId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessages = (text) => {
    if (!text.trim()) return;
    console.log("Sending message in Video:", text, "to room:", roomId);
    socket.emit("send-message", { roomId, text });
  };

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/auth/video/${videoId}`, {
        withCredentials: true,
      })
      .then((res) => setVideo(res.data))
      .catch((err) => console.error("Video load error", err));
  }, [videoId]);

  useEffect(() => {
    if (!socket) return;

    const handleVideoControl = async ({ action, currentTime, name }) => {
      if (!playerRef.current) {
        pendingInitialSync.current = { action, currentTime, name };
        return;
      }
      try {
        const currentState = await playerRef.current.getPlayerState();
        const localTime = await playerRef.current.getCurrentTime();

        let needsSeek = false;
        if (typeof currentTime === "number" && !isNaN(currentTime)) {
          const threshold = action === "pause" ? 0.5 : 2;
          if (Math.abs(localTime - currentTime) > threshold) {
            needsSeek = true;
          }
        }

        let willChangeState = false;
        if (action === "play" && currentState !== 1) willChangeState = true;
        if (action === "pause" && currentState !== 2) willChangeState = true;
        if (needsSeek) willChangeState = true;

        if (willChangeState) {
          ignoreNextStateChange.current = true;
          expectedState.current = action === "play" ? 1 : 2;
        }

        if (needsSeek) {
          // Add a slight 250ms offset for latency when playing to sync up perfectly
          const targetTime = action === "play" ? currentTime + 0.25 : currentTime;
          await playerRef.current.seekTo(targetTime, true);
        }

        if (action === "play") await playerRef.current.playVideo();
        else if (action === "pause") await playerRef.current.pauseVideo();

        // avoid spamming toast
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        toastTimeout.current = setTimeout(() => {
          if (name) { // name might not exist on initial sync
            toast.info(
              `${name} ${action === "pause" ? "paused" : "played"} the video`,
              {
                className:
                  "bg-black text-white font-bitcount rounded-lg shadow-lg",
                progressClassName: "bg-dotted-progress rounded-none",
                autoClose: 1500,
                position: "top-right",
              }
            );
          }
        }, 200);
      } catch (err) {
        console.error("Error syncing video:", err);
      }
    };

    socket.on("video-control", handleVideoControl);
    return () => socket.off("video-control", handleVideoControl);
  }, [socket]);

  const onPlayerReady = async (event) => {
    playerRef.current = event.target;
    if (pendingInitialSync.current) {
      const { action, currentTime } = pendingInitialSync.current;
      pendingInitialSync.current = null;

      try {
        // We do NOT set ignoreNextStateChange here. 
        // If autoplay succeeds, it will emit 'play' at currentTime (which causes no stutter for others).
        // If autoplay fails (browser blocked), the user must click play manually.
        // When they do, it will emit 'play' and bring everyone into sync.

        if (typeof currentTime === "number" && !isNaN(currentTime)) {
          const targetTime = action === "play" ? currentTime + 0.25 : currentTime;
          await playerRef.current.seekTo(targetTime, true);
        }
        if (action === "play") await playerRef.current.playVideo();
        else if (action === "pause") await playerRef.current.pauseVideo();
      } catch (err) {
        console.error("Initial sync error:", err);
      }
    }
  };

  // Instead of onPlay/onPause → use onStateChange
  const onPlayerStateChange = async (event) => {
    const time = await event.target.getCurrentTime();
    const ytState = event.data; // 1 = playing, 2 = paused, 3 = buffering

    if (ignoreNextStateChange.current) {
        if (ytState === expectedState.current) {
            ignoreNextStateChange.current = false;
            return; 
        } else if (ytState === 3 || ytState === -1) {
            // buffering or unstarted are intermediate, keep waiting
            return;
        } else {
            // User manually forced a contrary state (e.g. clicked play while we were expecting pause)
            ignoreNextStateChange.current = false;
        }
    }

    if (ytState === 1) {
      socket.emit("video-control", {
        roomId,
        action: "play",
        currentTime: time,
      });
    } else if (ytState === 2) {
      socket.emit("video-control", {
        roomId,
        action: "pause",
        currentTime: time,
      });
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleVideoSelected = ({ videoId: newVideoId, leader }) => {
      console.log("📺 Received video-selected:", newVideoId); // debug
      if (newVideoId !== videoId) {
        toast.success(`${leader} selected a new video!`);
        navigate(`/video/${newVideoId}`, { state: { roomId } });
      }
    };

    socket.on("video-selected", handleVideoSelected);

    return () => socket.off("video-selected", handleVideoSelected);
  }, [socket, roomId, videoId, navigate]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />

      {/* Main content row — fills remaining height below navbar */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Video column ── takes all space the chat doesn't use */}
        <div className="flex flex-col flex-1 min-w-0 p-4 md:p-6 gap-4 overflow-y-auto">

          {/* 16 / 9 video player */}
          <div
            className="w-full rounded-2xl border-4 border-white overflow-hidden relative"
            style={{ aspectRatio: "16 / 9" }}
          >
            <YouTube
              videoId={videoId}
              onReady={onPlayerReady}
              onStateChange={onPlayerStateChange}
              opts={{
                width: "100%",
                height: "100%",
                playerVars: { controls: 1, modestbranding: 1 },
              }}
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>

          {/* Title + stats — pinned to the video width, stats never overflow */}
          <div className="flex justify-between items-start gap-4 w-full">
            <h1 className="text-2xl lg:text-3xl min-w-0 leading-snug line-clamp-2">
              {video?.title || "Loading..."}
            </h1>
            <div className="flex gap-4 flex-shrink-0 items-center text-xl lg:text-2xl pt-1">
              <p className="flex items-center gap-2 cursor-default" title="likes">
                <img src="/liked.svg" className="w-8 lg:w-10" /> {video?.likes}
              </p>
              <p className="flex items-center gap-2 cursor-default" title="views">
                <img src="/views.svg" className="w-10 lg:w-12" /> {video?.views}
              </p>
            </div>
          </div>
        </div>

        {/* ── Resize handle ── */}
        <div
          onPointerDown={startResize}
          className="group flex-shrink-0 w-2 cursor-col-resize flex items-center justify-center hover:bg-white/10 transition-colors active:bg-white/20"
          title="Drag to resize chat"
        >
          <div className="flex flex-col gap-[3px] opacity-30 group-hover:opacity-80 transition-opacity">
            <span className="w-1 h-1 rounded-full bg-white" />
            <span className="w-1 h-1 rounded-full bg-white" />
            <span className="w-1 h-1 rounded-full bg-white" />
          </div>
        </div>

        {/* ── Chat sidebar ── resizable */}
        <div
          className="flex flex-col flex-shrink-0 border-l-4 border-white h-full"
          style={{ width: sidebarWidth }}
        >

          {/* Video Chat Container (Sidebar Version) */}
          {isVCEnabled && (
            <div className="w-full border-b-4 border-white flex-shrink-0 p-3 overflow-y-auto max-h-[40%] bg-stone-900">
              <CamGrid 
                localStream={localStream} 
                remoteStreams={remoteStreams} 
                toggleAudio={toggleAudio}
                toggleVideo={toggleVideo}
                isAudioMuted={isAudioMuted}
                isVideoMuted={isVideoMuted}
                stopVC={stopVC}
                isSidebar={true}
              />
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 relative">
            <ReactionBubbles roomId={roomId} />
            {messages.map((msg, i) => {
              const isMine = socket?.id === msg.senderId;
              return (
                <div
                  key={i}
                  className={`flex gap-2 mb-3 ${
                    isMine ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isMine && (
                    <img
                      src={msg.pfp}
                      alt={msg.name}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div
                    className={`max-w-[75%] p-2 rounded-lg text-sm ${
                      isMine
                        ? "bg-stone-800 text-white"
                        : "bg-slate-300 text-black"
                    }`}
                  >
                    {!isMine && (
                      <div className="font-light text-xs text-stone-600 mb-0.5">
                        {msg.name}
                      </div>
                    )}
                    <div className="break-words whitespace-pre-wrap">
                      {msg.text}
                    </div>
                  </div>
                  {isMine && (
                    <img
                      src={msg.pfp}
                      alt={msg.name}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>

          {/* Reaction Bar + Input */}
          <ReactionBar roomId={roomId} />
          <ChatInput sendMessages={sendMessages} />
        </div>
      </div>
    </div>
  );
}

export default Video;

