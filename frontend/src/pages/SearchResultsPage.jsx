import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { searchYouTube } from "../utils/YouTubeSearch";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (query) {
      searchYouTube(query).then((results) => {
        const formatted = results.map((item) => ({
          videoId: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high.url,
          channelTitle: item.snippet.channelTitle,
        }));
        setVideos(formatted);
        setLoading(false);
      });
    }
  }, [query]);

  const handleVideo = (videoId) => {
    const roomId = localStorage.getItem("roomId");
    toast.success("Video selected! Redirecting...");
    socket.emit("select-video", { videoId, roomId });
    navigate(`/video/${videoId}`, { state: { roomId } });
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-md mb-6 text-white">
        Search results for: <span className="italic">"{query}"</span>
      </h1>
      {loading ? (
        <Loader />
      ) : videos.length === 0 ? (
        <p className="text-white">No results found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.videoId}
              className="bg-stone-900 rounded-lg shadow hover:shadow-lg transition border-2 border-white break-words overflow-hidden cursor-pointer"
              onClick={() => handleVideo(video.videoId)}
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-80 object-cover rounded-t-lg"
              />
              <div className="p-4">
                <h3 className="text-lg font-medium text-white line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-400">{video.channelTitle}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchResultsPage;
