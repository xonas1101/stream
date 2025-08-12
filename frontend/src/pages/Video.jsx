import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useSocket } from "../context/socketContext";
import { toast } from "react-toastify";
import YouTube from "react-youtube";

function Video() {
  const { id: videoId } = useParams();
  const { state, search } = useLocation();
  const socket = useSocket();
  const [video, setVideo] = useState(null);

  // try state.roomId, fallback to ?roomId=... query param
  const roomId = state?.roomId ?? new URLSearchParams(search).get("roomId");

  const playerRef = useRef(null);
  const isRemoteAction = useRef(false);

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

    socket.on("video-control", async ({ action, currentTime, name }) => {
      if (!playerRef.current) return;
      try {
        isRemoteAction.current = true;
        // currentTime might be undefined — guard
        if (typeof currentTime === "number" && !isNaN(currentTime)) {
          await playerRef.current.seekTo(currentTime, true);
        }
        if (action === "play") await playerRef.current.playVideo();
        else if (action === "pause") await playerRef.current.pauseVideo();

        toast.info(`${name} ${action}ed the video`);
      } catch (err) {
        console.error("Error syncing video:", err);
      } finally {
        // small delay to avoid immediate re-emission
        setTimeout(() => (isRemoteAction.current = false), 100);
      }
    });

    return () => {
      socket.off("video-control");
    };
  }, [socket]);

  // handlers receive event from YouTube and only emit if not a remote-initiated action
  const handlePlay = async (event) => {
    if (isRemoteAction.current) return;
    const time = await event.target.getCurrentTime();
    socket.emit("video-control", { roomId, action: "play", currentTime: time });
  };

  const handlePause = async (event) => {
    if (isRemoteAction.current) return;
    const time = await event.target.getCurrentTime();
    socket.emit("video-control", {
      roomId,
      action: "pause",
      currentTime: time,
    });
  };

  // onReady: get player instance
  const onPlayerReady = (event) => {
    playerRef.current = event.target;
  };

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
              onPlay={handlePlay}
              onPause={handlePause}
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

        <div className="mt-12 flex flex-col gap-8">
          <div className="w-[20vw] h-[15.8vw] rounded-2xl border-4 border-white"></div>
          <div className="w-[20vw] h-[15.8vw] border-4 rounded-2xl border-white"></div>
        </div>
      </div>
    </>
  );
}

export default Video;
