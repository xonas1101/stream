import { useNavigate } from "react-router-dom";

function Logo() {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/");
  };
  return (
    <div
      className="flex items-center gap-6 cursor-pointer"
      onClick={handleClick}
    >
      <img src="./logo.svg" alt="logo" className="h-20 pt-4" />
      <p className="text-4xl font-bitcount text-white">Stream !</p>
    </div>
  );
}

export default Logo;
