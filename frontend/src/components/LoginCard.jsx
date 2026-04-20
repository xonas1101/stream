// import { useGoogleLogin } from "@react-oauth/google";
// import { googleAuth } from "../api";

// import { useNavigate } from "react-router-dom";

function LoginCard({ fadeOut }) {
  // const navigate = useNavigate();

  const handleLogin = () => {
    const returnTo = sessionStorage.getItem("returnTo");
    const query = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : "";
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google${query}`;
  };

  return (
    <div
      className={`bg-stone-900/50 backdrop-blur-xl border border-stone-800 shadow-2xl p-10 w-[90%] max-w-md rounded-2xl flex flex-col items-center gap-8 ${
        fadeOut ? "animate-zoomIn" : "hidden"
      } absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}
    >
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold bg-gradient-to-br from-white to-stone-400 bg-clip-text text-transparent">Sign in to Stream</h1>
        <p className="text-stone-400 text-center text-sm">Join the watch party and chat with your friends in real-time.</p>
      </div>
      <button 
        onClick={handleLogin} 
        className="flex items-center justify-center gap-3 bg-white hover:bg-stone-200 text-stone-900 border border-stone-300 w-full py-3 px-6 rounded-xl font-semibold shadow-sm transition-all focus:ring-4 focus:ring-stone-500/30 active:scale-95"
      >
        <img src="/google.svg" className="w-5 h-5" alt="Google Logo" />
        Continue with Google
      </button>
    </div>
  );
}

export default LoginCard;
