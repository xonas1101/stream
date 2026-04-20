import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/socketContext";
import ChatInput from "../components/ChatInput";
import ReactionBar from "../components/ReactionBar";
import ReactionBubbles from "../components/ReactionBubbles";
import { toast } from "react-toastify";
import { useWebRTC } from "../context/WebRTCContext";
import { CamGrid } from "../components/CamGrid";

function RoomPage() {
  const { state } = useLocation();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const {
    localStream,
    remoteStreams,
    toggleAudio,
    toggleVideo,
    isAudioMuted,
    isVideoMuted,
    isVCEnabled,
    isVCOngoing,
    startVC,
    stopVC
  } = useWebRTC();
  const [leaderName, setLeaderName] = useState(state?.leaderName ?? null);
  const name = leaderName ? leaderName.split(" ")[0] : "Unknown";
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState([]);
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    socket.on("leader-choosing-video", ({ leader }) => {
      toast.info(`${leader} is selecting a video...`);
    });

    socket.on("video-selected", ({ videoId, leader }) => {
      toast.success(`${leader} selected a video!`);
      navigate(`/video/${videoId}`, { state: { roomId } });
    });

    return () => {
      socket.off("leader-choosing-video");
      socket.off("video-selected");
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    
    // Make sure we emit join-room if already connected, or when it connects
    const handleJoin = () => {
      console.log("Emitting join-room for roomId:", roomId);
      socket.emit("join-room", { roomId });
    };

    // Always listen for connect (handles reconnects)
    socket.on("connect", handleJoin);

    // If already connected on mount, fire it once immediately
    if (socket.connected) {
      handleJoin();
    }

    socket.on("room-info", ({ leaderName }) => {
      console.log("Received room-info", leaderName);
      if (leaderName) setLeaderName(leaderName);
    });

    socket.on("room-messages", (msgs) => {
      console.log("Received room-messages:", msgs);
      setMessages(msgs || []);
    });

    socket.on("receive-message", (msg) => {
      console.log("Received message:", msg);
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("connect", handleJoin);
      socket.off("room-info");
      socket.off("room-messages");
      socket.off("receive-message");
    };
  }, [socket, roomId]);

  // Auto scroll on new message
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessages = (text) => {
    if (!text.trim()) return;

    socket.emit("send-message", { roomId, text });
  };

  const handleVideo = () => {
    socket.emit("leader-choosing-video", { roomId });
    navigate("/home", { state: { roomId } });
  };

  const copyLink = async () => {
    const link = localStorage.getItem("Invite_link");
    if (!link) {
      toast.error("No invite link found");
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 1000);
    } catch (e) {
      toast.error("Failed to copy");
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-2rem)]">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl flex justify-between items-center w-full p-4 shadow-xl mb-2">
        <div className="flex gap-4">
          <button 
            onClick={() => navigate("/home", { state: { roomId } })} 
            className="flex items-center gap-2 px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg hover:bg-stone-700 text-stone-200 transition-all font-semibold active:scale-95 text-sm md:text-base"
          >
            ← Home
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem("roomId");
              localStorage.removeItem("Invite_link");
              socket.emit("leave-vc", { roomId });
              navigate("/home");
            }} 
            className="flex items-center gap-2 px-4 py-2 bg-red-900/40 border border-red-800/60 rounded-lg hover:bg-red-800/60 text-red-200 transition-all font-semibold active:scale-95 text-sm md:text-base"
          >
            Leave room
          </button>
        </div>

        <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-stone-100 to-stone-400 bg-clip-text text-transparent px-4 truncate">
          {name ? `${name}'s Room` : `Unknown's Room`}
        </span>

        <div className="flex gap-4">
          <button 
            onClick={copyLink} 
            className="px-4 py-2 bg-emerald-900/40 border border-emerald-800/60 rounded-lg hover:bg-emerald-800/60 text-emerald-200 transition-all font-semibold active:scale-95 text-sm md:text-base whitespace-nowrap"
          >
            {copied ? "Copied!" : "Copy Link"}
          </button>
          {!isVCEnabled && (
            <button 
              onClick={() => startVC(roomId)} 
              className={`px-4 py-2 border rounded-lg font-semibold transition-all active:scale-95 text-sm md:text-base whitespace-nowrap ${
                isVCOngoing 
                  ? "bg-green-600/80 text-white border-green-500 animate-[pulse_2s_ease-in-out_infinite] hover:bg-green-500" 
                  : "bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700"
              }`}
            >
              {isVCOngoing ? "📞 Join Video Chat" : "Start Video Chat"}
            </button>
          )}
          <button 
            onClick={handleVideo} 
            className="px-4 py-2 bg-stone-100 hover:bg-stone-300 text-stone-900 border border-transparent rounded-lg font-bold transition-all active:scale-95 text-sm md:text-base whitespace-nowrap"
          >
            Select Video
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden bg-stone-900/50 rounded-2xl border border-stone-800 backdrop-blur-sm">
        {/* Videos Container - Only show if VC is enabled */}
        {isVCEnabled && (
          <div className="flex flex-col w-2/3 p-4 border-r border-gray-800">
            <CamGrid 
              localStream={localStream} 
              remoteStreams={remoteStreams} 
              toggleAudio={toggleAudio}
              toggleVideo={toggleVideo}
              isAudioMuted={isAudioMuted}
              isVideoMuted={isVideoMuted}
              stopVC={stopVC}
            />
          </div>
        )}

        {/* Messages Layout */}
        <div className="flex flex-col flex-1 relative">
          <div className="flex-1 overflow-y-auto p-4 pb-[80px] relative">
            <ReactionBubbles roomId={roomId} />
            {messages.map((msg, i) => {
              const isMine = socket?.id === msg.senderId;
              console.log("Rendering message:", {
                text: msg.text,
                pfp: msg.pfp,
                isMine,
                socketId: socket.id,
                senderId: msg.senderId,
              });

              return (
                <div
                  key={i}
                  className={`flex gap-4 mb-4 mr-4 ${
                    isMine ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isMine && (
                    <img
                      src={msg.pfp}
                      alt={msg.name}
                      className="w-10 h-10 rounded-full mr-2"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      isMine ? "bg-stone-800 text-white" : "bg-slate-300 text-black"
                    }`}
                  >
                    {!isMine && (
                      <div className="font-light text-stone-900">{msg.name}</div>
                    )}
                    <div className="text-xl break-words whitespace-pre-wrap">
                      {msg.text}
                    </div>
                  </div>
                  {isMine && (
                    <img
                      src={msg.pfp}
                      alt={msg.name}
                      className="w-10 h-10 rounded-full ml-2"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>

          <div className="flex flex-col">
            <ReactionBar roomId={roomId} />
            <ChatInput sendMessages={sendMessages} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomPage;
