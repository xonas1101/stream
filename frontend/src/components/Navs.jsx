import { NavLink } from "react-router-dom";
import User from "./User";

function Navs() {
  return (
    <div className="flex items-center gap-4 text-white font-bitcount text-2xl">
      <NavLink to="/" className="hover:underline decoration-dotted">
        Home
      </NavLink>
      <NavLink to="/" className="hover:underline decoration-dotted">
        Watch
      </NavLink>
      <NavLink to="/" className="hover:underline decoration-dotted">
        Pricing
      </NavLink>
      <NavLink to="/" className="hover:underline decoration-dotted">
        About
      </NavLink>
      <User />
    </div>
  );
}

export default Navs;
