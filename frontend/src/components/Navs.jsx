import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import User from "./User";

function Navs() {
  const { state } = useLocation();
  const roomId = state?.roomId || localStorage.getItem("roomId");

  return (
    <div className="flex items-center gap-2 md:gap-6 bg-stone-900/60 border border-stone-800 px-4 md:px-6 py-2 rounded-full shadow-sm backdrop-blur-md">
      <NavLink 
        to="/home" 
        state={{ roomId }} 
        className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? "text-white" : "text-stone-400 hover:text-stone-200"}`}
      >
        Home
      </NavLink>

      <NavLink 
        to="/trending" 
        state={{ roomId }} 
        className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? "text-white" : "text-stone-400 hover:text-stone-200"}`}
      >
        Watch
      </NavLink>

      {roomId && (
        <NavLink
          to={`/room/${roomId}`}
          state={{ roomId }}
          className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? "text-red-400" : "text-red-400/60 hover:text-red-300"}`}
        >
          ● Live Room
        </NavLink>
      )}

      <NavLink 
        to="/about" 
        state={{ roomId }} 
        className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? "text-white" : "text-stone-400 hover:text-stone-200"} pr-4 border-r border-stone-800`}
      >
        About
      </NavLink>

      <User />
    </div>
  );
}

export default Navs;
