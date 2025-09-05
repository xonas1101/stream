import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useSocket } from "../context/socketContext";
import { toast } from "react-toastify";
import YouTube from "react-youtube";
import ChatInput from "../components/ChatInput";

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
    <>
      <Navbar />
      <div className="h-screen w-[100%] flex gap-12">
        <div className="flex flex-col gap-4 mt-12 ml-12">
          <div
            className="w-[60vw] rounded-2xl border-4 border-white overflow-hidden relative"
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

          <div className="flex justify-between">
            <h1 className="text-3xl">{video?.title || "Loading..."}</h1>
            <div className="text-3xl flex gap-4 mr-4">
              <p className="flex items-end gap-2 cursor-default" title="likes">
                <img src="/liked.svg" className="w-10" /> {video?.likes}
              </p>
              <p className="flex items-end gap-2 cursor-default" title="views">
                <img src="/views.svg" className="w-12" /> {video?.views}
              </p>
            </div>
          </div>
        </div>

        {/* Chat box column */}
        <div className="mt-12 flex flex-col w-[30vw] h-[33.75vw] border-4 border-white rounded-2xl overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
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
                      className="w-8 h-8 rounded-full"
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
                      <div className="font-light text-xs text-stone-900">
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
                      className="w-8 h-8 rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>

          {/* Input */}
          <ChatInput sendMessages={sendMessages} />
        </div>
      </div>
    </>
  );
}

export default Video;
