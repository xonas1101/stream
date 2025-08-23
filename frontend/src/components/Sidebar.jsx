import { useNavigate } from "react-router-dom";
import CreateRoomButton from "./CreateRoomButton";

function Sidebar() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col h-screen justify-between">
      <div>
        <div className="flex gap-4 items-start pb-4 hover:underline decoration-dotted cursor-pointer">
          <img src="/home.svg" className="w-6" />
          <p
            className="text-2xl hover:underline decoration-dotted cursor-pointer"
            onClick={() => navigate("/home")}
          >
            Home
          </p>
        </div>

        <div className="flex gap-4 items-start pb-4 hover:underline decoration-dotted cursor-pointer">
          <img src="/trending.svg" className="w-6" />
          <p
            className="text-2xl hover:underline decoration-dotted"
            onClick={() => navigate("/trending")}
          >
            Trending
          </p>
        </div>

        <div className="flex gap-4 items-start pb-4 hover:underline decoration-dotted cursor-pointer">
          <img src="/liked.svg" className="w-8" />
          <p
            className="text-2xl hover:underline decoration-dotted"
            onClick={() => navigate("/liked")}
          >
            Liked
          </p>
        </div>
        <CreateRoomButton />
      </div>
    </div>
  );
}

export default Sidebar;
