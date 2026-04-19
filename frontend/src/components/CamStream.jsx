import React, { useEffect, useRef } from "react";

export const CamStream = ({ stream, isLocal = false, name = "User" }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative group overflow-hidden rounded-lg bg-gray-900 border border-gray-700 aspect-video shadow-md">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full object-cover ${isLocal ? "scale-x-[-1]" : ""}`}
      />
      <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
        {isLocal ? "You" : name}
      </div>
    </div>
  );
};
