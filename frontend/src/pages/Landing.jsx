import { useEffect, useState } from "react";
import Particles from "../ui/Particles";
import LoginCard from "../components/LoginCard";
import { GoogleOAuthProvider } from "@react-oauth/google";
function Landing() {
  const [showComponent, setShowComponent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowComponent(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const [fadeOut, setFadeOut] = useState(false);

  const handleClick = () => {
    setFadeOut(true);
    console.log(fadeOut);
  };

  useEffect(() => {
    if (fadeOut) {
      // after animation (1.5s), remove Landing page from DOM
      const timer = setTimeout(() => {}, 1500); // match duration of goTop/goBottom

      return () => clearTimeout(timer);
    }
  }, [fadeOut]);

  return (
    <div className="relative w-full h-screen" onClick={handleClick}>
      <div className="w-[100%] h-screen bg-black overflow-hidden">
        <Particles
          particleColors={["#ffffff", "#ffffff"]}
          particleCount={500}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>
      {/* //className={`text-7xl absolute left-1/4 ${
          fadeOut ? "animate-goTop" : "animate-slideFromTop"
        }`} */}

      <h2
        className={`text-7xl absolute left-1/4 animate-slideFromTop cursor-default
        `}
      >
        Welcome to
      </h2>
      <div
        className={`flex items-start absolute left-1/4 cursor-default justify-center gap-4 animate-slideFromBottom`}
      >
        <img src="./logo.svg" alt="Logo" className="w-32" />
        <h1 className="text-7xl ">Stream !</h1>
      </div>
      {showComponent && (
        <p
          className={`inline-block text-2xl cursor-default absolute left-1/4 ${
            fadeOut ? "hidden" : "animate-slideAndPulse"
          }`}
        >
          Click anywhere to continue...
        </p>
      )}
      <GoogleOAuthProvider clientId={import.meta.env.VITE_OAUTH_CLIENT_ID}>
        <LoginCard fadeOut={fadeOut} />
      </GoogleOAuthProvider>
    </div>
  );
}

export default Landing;
