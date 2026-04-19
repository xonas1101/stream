import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "../context/socketContext";

export default function ReactionBubbles({ roomId }) {
  const socket = useSocket();
  const [bubbles, setBubbles] = useState([]);
  const idCounter = useRef(0);

  const addBubble = useCallback((emoji) => {
    const id = idCounter.current++;
    // Random horizontal position between 5% and 95%
    const left = Math.random() * 90 + 5;
    // Slight random delay for organic feel
    const delay = Math.random() * 0.15;
    // Random size variation
    const scale = 0.8 + Math.random() * 0.6;
    // Random drift direction
    const drift = (Math.random() - 0.5) * 60;

    setBubbles((prev) => [...prev, { id, emoji, left, delay, scale, drift }]);

    // Remove bubble after animation completes (4s animation + delay)
    setTimeout(() => {
      setBubbles((prev) => prev.filter((b) => b.id !== id));
    }, 4500 + delay * 1000);
  }, []);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleReaction = ({ emoji }) => {
      addBubble(emoji);
    };

    socket.on("receive-reaction", handleReaction);
    return () => socket.off("receive-reaction", handleReaction);
  }, [socket, roomId, addBubble]);

  return (
    <div className="reaction-bubbles-container" aria-hidden="true">
      {bubbles.map((bubble) => (
        <span
          key={bubble.id}
          className="reaction-bubble"
          style={{
            left: `${bubble.left}%`,
            animationDelay: `${bubble.delay}s`,
            "--bubble-scale": bubble.scale,
            "--bubble-drift": `${bubble.drift}px`,
          }}
        >
          {bubble.emoji}
        </span>
      ))}
    </div>
  );
}
