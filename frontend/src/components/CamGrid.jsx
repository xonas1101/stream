import React from "react";
import { CamStream } from "./CamStream";

export const CamGrid = ({
  localStream,
  remoteStreams,
  toggleAudio,
  toggleVideo,
  isAudioMuted,
  isVideoMuted,
  isSidebar = false,
  stopVC,
}) => {
  const remoteEntries = Object.entries(remoteStreams || {});

  // Decide grid columns based on total participants
  const totalStreams = 1 + remoteEntries.length;
  let gridClass = "grid-cols-1";
  if (isSidebar) {
    gridClass = totalStreams >= 2 ? "grid-cols-2" : "grid-cols-1";
  } else {
    if (totalStreams >= 2 && totalStreams <= 4) gridClass = "grid-cols-2";
    else if (totalStreams > 4) gridClass = "grid-cols-3";
  }

  return (
    <div className={`grid ${isSidebar ? 'gap-2' : 'gap-4'} ${gridClass} w-full auto-rows-fr`}>
      {/* Local Stream */}
      {localStream ? (
        <div className="relative group">
          <CamStream stream={localStream} isLocal={true} />
          
          {/* Controls overlay */}
          <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 ${isSidebar ? 'px-2 py-1' : 'px-3 py-2'} rounded-full backdrop-blur-sm`}>
            <button
              onClick={toggleAudio}
              className={`${isSidebar ? 'p-1.5 text-xs' : 'p-2'} rounded-full flex items-center justify-center transition-colors ${
                isAudioMuted ? "bg-red-500 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-600"
              }`}
              title={isAudioMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isAudioMuted ? "🔇" : "🎤"}
            </button>
            <button
              onClick={toggleVideo}
              className={`${isSidebar ? 'p-1.5 text-xs' : 'p-2'} rounded-full flex items-center justify-center transition-colors ${
                isVideoMuted ? "bg-red-500 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-600"
              }`}
              title={isVideoMuted ? "Turn Camera On" : "Turn Camera Off"}
            >
              {isVideoMuted ? "🚫" : "📷"}
            </button>
            {stopVC && (
              <button
                onClick={stopVC}
                className={`${isSidebar ? 'p-1.5 text-xs px-2' : 'p-2 px-3'} rounded-full flex items-center justify-center transition-colors bg-red-600 hover:bg-red-700 font-bold`}
                title="Hang Up"
              >
                End Call
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center border border-gray-700 animate-pulse">
          <span className="text-gray-400">Loading Camera...</span>
        </div>
      )}

      {/* Remote Streams */}
      {remoteEntries.map(([userId, user]) => (
        <CamStream
          key={userId}
          stream={user.stream}
          name={user.name}
          pfp={user.pfp} // Could overlay picture if stream fails
        />
      ))}
    </div>
  );
};
