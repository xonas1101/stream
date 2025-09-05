import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import VideoGrid from "../components/VideoGrid";
import { useSocket } from "../context/socketContext";
import { toast } from "react-toastify";

function Home() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const socket = useSocket();
  const location = useLocation();
  const roomId =
    location?.state?.roomId ??
    new URLSearchParams(window.location.search).get("roomId");

  useEffect(() => {
    axios
      .get("http://localhost:5000/auth/feed", { withCredentials: true })
      .then((res) => {
        setFeed(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Feed load error", err);
        setLoading(false);
      });
  }, []);

  const handleVideo = (videoId) => {
    const roomId = localStorage.getItem("roomId");
    toast.success("Video selected! Redirecting...");
    socket.emit("select-video", { videoId, roomId });
    navigate(`/video/${videoId}`, { state: { roomId } });
  };

  return (
    <div className="p-8">
      {loading ? (
        <div className="h-64">
          <Loader />
        </div>
      ) : (
        feed.map((channel, idx) => (
          <VideoGrid
            key={idx}
            title={channel.channelTitle}
            videos={channel.videos}
            handleVideo={handleVideo}
          />
        ))
      )}
    </div>
  );
}

export default Home;
