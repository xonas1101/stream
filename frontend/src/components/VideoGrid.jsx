function VideoGrid({ title, videos, handleVideo }) {
  return (
    <div className="mb-12">
      {title && <h2 className="text-2xl font-semibold mb-4">{title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {videos.map((video, vidIdx) => (
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
  );
}

export default VideoGrid;
