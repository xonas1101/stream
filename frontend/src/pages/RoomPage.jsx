import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/socketContext";
import ChatInput from "../components/ChatInput";
import { toast } from "react-toastify";

function RoomPage() {
  const { state } = useLocation();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [leaderName, setLeaderName] = useState(state?.leaderName ?? null);
  const name = leaderName ? leaderName.split(" ")[0] : "Unknown";

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
    socket.emit("join-room", { roomId });

    socket.on("room-info", ({ leaderName }) => {
      if (leaderName) setLeaderName(leaderName);
    });

    socket.on("room-messages", (msgs) => {
      setMessages(msgs || []);
    });

    socket.on("receive-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
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

  return (
    <div className="flex flex-col gap-4 h-screen">
      <div className="bg-black flex justify-between items-center w-[100%] h-[15%] px-8">
        <div>Leave room</div>
        <span className="text-5xl">
          {name ? `${name}'s Room` : `Unknown's Room`}
        </span>
        <div className="flex gap-4">
          <div>Video chat option</div>
          <div>Voice chat option</div>
          <div onClick={handleVideo}>Select a video!</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
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

      <ChatInput sendMessages={sendMessages} />
    </div>
  );
}

export default RoomPage;
