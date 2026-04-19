import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "../context/socketContext";

export default function ReactionBubbles({ roomId }) {
  const socket = useSocket();
  const [bubbles, setBubbles] = useState([]);
  const idCounter = useRef(0);

  const addBubble = useCallback(({ emoji, pfp, name }) => {
    const id = idCounter.current++;
    // Random horizontal position between 5% and 90%
    const left = Math.random() * 85 + 5;
    // Slight random delay for organic feel
    const delay = Math.random() * 0.15;
    // Random size variation
    const scale = 0.85 + Math.random() * 0.4;
    // Random drift direction
    const drift = (Math.random() - 0.5) * 50;

    setBubbles((prev) => [...prev, { id, emoji, pfp, name, left, delay, scale, drift }]);

    // Remove bubble after animation completes (4s + delay)
    setTimeout(() => {
      setBubbles((prev) => prev.filter((b) => b.id !== id));
    }, 4500 + delay * 1000);
  }, []);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleReaction = ({ emoji, pfp, name }) => {
      addBubble({ emoji, pfp, name });
    };

    socket.on("receive-reaction", handleReaction);
    return () => socket.off("receive-reaction", handleReaction);
  }, [socket, roomId, addBubble]);

  return (
    <div className="reaction-bubbles-container" aria-hidden="true">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="reaction-bubble"
          style={{
            left: `${bubble.left}%`,
            animationDelay: `${bubble.delay}s`,
            "--bubble-scale": bubble.scale,
            "--bubble-drift": `${bubble.drift}px`,
          }}
        >
          {/* Avatar */}
          {bubble.pfp && (
            <img
              src={bubble.pfp}
              alt={bubble.name}
              title={bubble.name}
              className="reaction-avatar"
              referrerPolicy="no-referrer"
            />
          )}
          {/* Emoji badge */}
          <span className="reaction-emoji-badge">{bubble.emoji}</span>
        </div>
      ))}
    </div>
  );
}
