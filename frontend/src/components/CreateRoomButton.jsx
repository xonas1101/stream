import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useSocket } from "../context/socketContext";

function CreateRoomButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const socket = useSocket();
  
  const handleClick = () => {
    // If they click create room, we enforce creating a NEW one, so we clear the old one first to avoid confusion
    localStorage.removeItem("roomId");
    localStorage.removeItem("Invite_link");

    if (!socket) return;

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/me`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => {
        console.log("✅ Authenticated as:", data);
        if (!socket.connected) socket.connect();

        socket.emit("create-room");
        socket.once("room-created", ({ roomId, inviteLink, leaderName }) => {
          localStorage.setItem("roomId", roomId);
          navigate(`/room/${roomId}`, { state: { leaderName } });
          localStorage.setItem("Invite_link", inviteLink);
        });
      })
      .catch((err) => {
        console.error("🚫 User not authenticated:", err);
      });
  };

  return (
    <button
      className="fixed bottom-10 left-10 md:left-12 flex items-center justify-center gap-3 bg-stone-100 hover:bg-white text-stone-900 px-6 py-4 rounded-full font-bold shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_8px_40px_rgba(255,255,255,0.15)] transition-all duration-300 hover:-translate-y-1 active:scale-95 group z-50 overflow-hidden"
      onClick={handleClick}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
      <img src="/room.svg" className="w-5 h-5 invert relative z-10" alt="Room Icon" />
      <span className="hidden md:inline relative z-10 group-hover:tracking-wide transition-all">Create Room</span>
    </button>
  );
}

export default CreateRoomButton;
