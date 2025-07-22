import { useNavigate } from "react-router-dom";

function LoginCard({ fadeOut }) {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/home");
  };

  return (
    <div
      className={`border-2  px-8 py-8 w-[25%] border-solid rounded-lg  items-center flex flex-col gap-12 border-white absolute top-[20%] left-[55%] text-2xl ${
        fadeOut ? "animate-zoomIn" : "hidden"
      }`}
    >
      <input
        type="text"
        placeholder="Username or E-mail"
        className="bg-black border-4 border-dotted border-white h-12 focus:outline-none focus:ring-0 focus:border-dotted w-[95%]"
      />
      <input
        type="text"
        placeholder="Password"
        className="bg-black border-4 border-dotted border-white h-12 focus:outline-none focus:ring-0 focus:border-dotted w-[95%]"
      />
      <button
        className="p-4 bg-white rounded-lg text-black inline-block w-[95%]"
        onClick={handleLogin}
      >
        Sign In
      </button>
      <div className="flex justify-between w-[95%]">
        <p className="text-xl cursor-default">
          New Here?{" "}
          <button className="hover:underline decoration-dotted">SignUp</button>
        </p>
        <button className="text-xl hover:underline decoration-dotted">
          Raise Issues
        </button>
      </div>
    </div>
  );
}

export default LoginCard;
