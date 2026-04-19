import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useSocket } from "../context/socketContext";

function CreateRoomButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const socket = useSocket();
  
  const existingRoomId = location.state?.roomId || localStorage.getItem("roomId");

  const handleClick = () => {
    if (existingRoomId) {
      navigate(`/room/${existingRoomId}`, { state: { roomId: existingRoomId } });
      return;
    }

    if (!socket) return;

    fetch("http://localhost:5001/api/me", {
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
      className="fixed bottom-12 left-12 rounded-full bg-white w-16 p-4"
      onClick={handleClick}
    >
      <img src="./room.svg" />
    </button>
  );
}

export default CreateRoomButton;
