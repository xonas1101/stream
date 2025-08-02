import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function Video() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/auth/video/${id}`, { withCredentials: true })
      .then((res) => setVideo(res.data))
      .catch((err) => console.error("Video load error", err));
  }, [id]);

  return (
    <>
      <Navbar />
      <div className="h-screen w-[100%] flex gap-12">
        <div className="flex flex-col gap-4 mt-12 ml-12">
          <div className="w-[60vw] h-[33.375vw] rounded-2xl border-4 border-white">
            <iframe
              className="w-full h-full rounded-2xl"
              src={`https://www.youtube.com/embed/${id}`}
              title={video?.title}
              allow="autoplay; encrypted-media"
              allowFullScreen
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
