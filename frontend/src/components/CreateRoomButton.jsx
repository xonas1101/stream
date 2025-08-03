import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/socketContext";

function CreateRoomButton() {
  const navigate = useNavigate();
  const socket = useSocket();
  const handleClick = () => {
    if (!socket.connected) socket.connect();
    socket.emit("create-room");

    socket.once("room-created", ({ roomId }) => {
      console.log(roomId);
      navigate(`/room/${roomId}`);
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
