import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import User from "./User";

function Navs() {
  const { state } = useLocation();
  const [roomId, setRoomId] = useState(() => {
    return localStorage.getItem("roomId");
  });

  useEffect(() => {
    if (state?.roomId) {
      setRoomId(state.roomId);
      localStorage.setItem("roomId", state.roomId);
    }
  }, [state]);

  return (
    <div className="flex items-center gap-4 text-white font-bitcount text-2xl">
      <NavLink to="/home" className="hover:underline decoration-dotted">
        Home
      </NavLink>

      <NavLink to="/trending" className="hover:underline decoration-dotted">
        Watch
      </NavLink>

      {roomId && (
        <NavLink
          to={`/room/${roomId}`}
          className="hover:underline decoration-dotted"
        >
          Room
        </NavLink>
      )}

      <NavLink to="/about" className="hover:underline decoration-dotted">
        About
      </NavLink>

      <User />
    </div>
  );
}

export default Navs;
