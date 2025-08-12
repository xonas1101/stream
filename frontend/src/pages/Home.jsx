import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
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
    toast.success("Video selected! Redirecting...");
    console.log(
      "emitting select-video",
      { roomId, videoId },
      "socket:",
      !!socket
    );
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
          <div key={idx} className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">
              {channel.channelTitle}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 ">
              {channel.videos.map((video, vidIdx) => (
                <div
                  key={vidIdx}
                  className="bg-stone-900 rounded-lg shadow hover:shadow-lg transition border-2 border-white break-words overflow-hidden cursor-pointer"
                  onClick={() => handleVideo(video.videoId)}
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-80 object-cover rounded-lg"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-md">{video.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Home;
