import Logo from "./Logo";
import Navs from "./Navs";
import Search from "./Search";

function Navbar() {
  return (
    <div className=" py-5 px-10 bg-[#000] w-screen h-32 flex justify-between items-centershadow-md">
      <Logo />
      <Search />
      <Navs />
    </div>
  );
}

export default Navbar;
