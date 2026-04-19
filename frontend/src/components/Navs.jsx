import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import User from "./User";

function Navs() {
  const { state } = useLocation();
  const roomId = state?.roomId || localStorage.getItem("roomId");

  return (
    <div className="flex items-center gap-4 text-white font-bitcount text-2xl">
      <NavLink to="/home" state={{ roomId }} className="hover:underline decoration-dotted">
        Home
      </NavLink>

      <NavLink to="/trending" state={{ roomId }} className="hover:underline decoration-dotted">
        Watch
      </NavLink>

      {roomId && (
        <NavLink
          to={`/room/${roomId}`}
          state={{ roomId }}
          className="hover:underline decoration-dotted"
        >
          Room
        </NavLink>
      )}

      <NavLink to="/about" state={{ roomId }} className="hover:underline decoration-dotted">
        About
      </NavLink>

      <User />
    </div>
  );
}

export default Navs;
