// import { useGoogleLogin } from "@react-oauth/google";
// import { googleAuth } from "../api";

// import { useNavigate } from "react-router-dom";

function LoginCard({ fadeOut }) {
  // const navigate = useNavigate();

  const handleLogin = () => {
    const returnTo = sessionStorage.getItem("returnTo");
    const query = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : "";
    window.location.href = `http://localhost:5001/auth/google${query}`;
  };

  return (
    <div
      className={`border-2  px-8 py-8 w-[25%] border-solid rounded-lg  items-center flex flex-col gap-12 border-white absolute top-[25%] left-[55%] text-2xl ${
        fadeOut ? "animate-zoomIn" : "hidden"
      }`}
    >
      <h1 className="text-5xl">Sign in to Stream!</h1>
      <button onClick={handleLogin} className="flex items-start gap-2 text-3xl">
        <img src="/google.svg" className="w-6 " />
        Sign In with Google
      </button>
    </div>
  );
}

export default LoginCard;
