import { useEffect } from "react";
import Particles from "../ui/Particles";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();
  const handleRedirect = () => {
    navigate("/home");
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://tenor.com/embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
  return (
    <div className="relative h-screen w-[100%]">
      <div className="w-[100%] absolute inset-0 z-0 h-screen bg-black overflow-hidden">
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
      <div className="absolute z-10 top-1/3 left-1/4 flex gap-4">
        <img src="/sadmario.png" alt="sad mario" className="w-64" />
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <img src="/coin.png" alt="coin" className="w-16 h-12" />
            <p className="text-5xl">x 404</p>
          </div>
          <h1 className="text-7xl">Page Not Found :{`(`} </h1>
        </div>
      </div>

      <div className="text-5xl absolute z-10 top-1/2 left-[30%] flex flex-col items-center">
        <img
          src="/1up.png"
          alt="1up"
          className="w-24 cursor-pointer"
          onClick={handleRedirect}
        />
        Use This 1UP to help Princess Peach!
      </div>
    </div>
  );
}

export default NotFound;
