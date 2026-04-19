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

function Video() {
  const { id: videoId } = useParams();
  const { state, search } = useLocation();
  const socket = useSocket();
  const [video, setVideo] = useState(null);

  const roomId = state?.roomId ?? new URLSearchParams(search).get("roomId");

  const playerRef = useRef(null);
  const isRemoteAction = useRef(false);
  const lastAction = useRef(null); // prevent duplicate emits
  const toastTimeout = useRef(null); // prevent spam toasts

  const [messages, setMessages] = useState([]);
  const messageEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket || !roomId) return;
    socket.emit("join-room", { roomId });

    socket.on("room-messages", (msgs) => setMessages(msgs || []));
    socket.on("receive-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("room-messages");
      socket.off("receive-message");
    };
  }, [socket, roomId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessages = (text) => {
    if (!text.trim()) return;
    socket.emit("send-message", { roomId, text });
  };

  useEffect(() => {
    axios
      .get(`http://localhost:5000/auth/video/${videoId}`, {
        withCredentials: true,
      })
      .then((res) => setVideo(res.data))
      .catch((err) => console.error("Video load error", err));
  }, [videoId]);

  useEffect(() => {
    if (!socket) return;

    const handleVideoControl = async ({ action, currentTime, name }) => {
      if (!playerRef.current) return;
      try {
        isRemoteAction.current = true;

        if (typeof currentTime === "number" && !isNaN(currentTime)) {
          await playerRef.current.seekTo(currentTime, true);
        }
        if (action === "play") await playerRef.current.playVideo();
        else if (action === "pause") await playerRef.current.pauseVideo();

        // avoid spamming toast
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        toastTimeout.current = setTimeout(() => {
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
        }, 200);
      } catch (err) {
        console.error("Error syncing video:", err);
      } finally {
        setTimeout(() => (isRemoteAction.current = false), 200);
      }
    };

    socket.on("video-control", handleVideoControl);
    return () => socket.off("video-control", handleVideoControl);
  }, [socket]);

  const onPlayerReady = (event) => {
    playerRef.current = event.target;
  };

  // Instead of onPlay/onPause → use onStateChange
  const onPlayerStateChange = async (event) => {
    if (isRemoteAction.current) return;

    const time = await event.target.getCurrentTime();
    const ytState = event.data; // 1 = playing, 2 = paused

    if (ytState === 1 && lastAction.current !== "play") {
      lastAction.current = "play";
      socket.emit("video-control", {
        roomId,
        action: "play",
        currentTime: time,
      });
    } else if (ytState === 2 && lastAction.current !== "pause") {
      lastAction.current = "pause";
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

        {/* ── Chat sidebar ── fixed width, full remaining height */}
        <div className="flex flex-col w-72 lg:w-80 xl:w-96 flex-shrink-0 border-l-4 border-white h-full">

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

