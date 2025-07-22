import { useEffect, useState } from "react";
import Particles from "../ui/Particles";

function Landing() {
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
        className={`text-7xl absolute left-1/4 ${
          fadeOut ? "animate-goTop" : "animate-slideFromTop"
        }`}
      >
        Welcome to
      </h2>
      <div
        className={`flex items-start absolute left-1/4 justify-center gap-4 ${
          fadeOut ? "animate-goBottom" : "animate-slideFromBottom"
        }`}
      >
        <img src="./logo.svg" alt="Logo" className="w-32" />
        <h1 className="text-7xl ">Stream !</h1>
      </div>
    </div>
  );
}

export default Landing;
