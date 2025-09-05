import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { useSocket } from "../context/socketContext";
import { toast } from "react-toastify";
import VideoGrid from "../components/VideoGrid";

function Trending() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const socket = useSocket();
  const location = useLocation();
  const roomId =
    location?.state?.roomId ??
    new URLSearchParams(window.location.search).get("roomId");

  useEffect(() => {
    axios
      .get("http://localhost:5000/auth/trending", { withCredentials: true })
      .then((res) => {
        setVideos(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Trending videos load error", err);
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
      <h2 className="text-2xl font-semibold mb-6">Trending Videos</h2>
      {loading ? (
        <div className="h-64">
          <Loader />
        </div>
      ) : (
        <VideoGrid title={""} videos={videos} handleVideo={handleVideo} />
      )}
    </div>
  );
}

export default Trending;
