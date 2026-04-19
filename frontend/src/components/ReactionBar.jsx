import { useSocket } from "../context/socketContext";

const REACTIONS = [
  { emoji: "👍", label: "Thumbs Up" },
  { emoji: "❤️", label: "Heart" },
  { emoji: "😂", label: "Laughing" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "👏", label: "Clapping" },
  { emoji: "😮", label: "Surprised" },
];

export default function ReactionBar({ roomId }) {
  const socket = useSocket();

  const handleReaction = (emoji) => {
    if (!socket || !roomId) return;
    socket.emit("send-reaction", { roomId, emoji });
  };

  return (
    <div className="reaction-bar">
      {REACTIONS.map((r) => (
        <button
          key={r.emoji}
          className="reaction-btn"
          onClick={() => handleReaction(r.emoji)}
          title={r.label}
          aria-label={`React with ${r.label}`}
        >
          <span className="reaction-emoji">{r.emoji}</span>
        </button>
      ))}
    </div>
  );
}
