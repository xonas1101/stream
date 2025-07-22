import { useEffect, useRef, useState } from "react";

function MarioFollower() {
  const [target, setTarget] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isJumping, setIsJumping] = useState(false);
  const animationRef = useRef(null);

  useEffect(() => {
    const updateTarget = (e) => {
      setTarget({ x: e.clientX, y: e.clientY });
    };

    const handleClick = () => {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 600);
    };

    window.addEventListener("mousemove", updateTarget);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("mousemove", updateTarget);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  // Lag effect using requestAnimationFrame
  useEffect(() => {
    const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

    const animate = () => {
      setPosition((prev) => ({
        x: lerp(prev.x, target.x, 0.1),
        y: lerp(prev.y, target.y, 0.1),
      }));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [target]);

  return (
    <img
      src={`${isJumping ? "/clickcursor.svg" : "/normalcursor.svg"}`}
      alt="Mario"
      className={`pointer-events-none fixed z-50 w-12 h-12 ease-linear will-change-transform transition-transform ${
        isJumping ? "animate-marioJump" : ""
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-40px, 20px)", // Offset from cursor
      }}
    />
  );
}

export default MarioFollower;
