import { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";

export default function ChatInput({ sendMessages }) {
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  const handleSend = (message) => {
    if (!message.trim()) return;
    sendMessages(message);
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        e.preventDefault();
        const cursorPos = e.target.selectionStart;
        const textBefore = input.substring(0, cursorPos);
        const textAfter = input.substring(cursorPos);
        setInput(textBefore + "\n" + textAfter);
        setTimeout(() => {
          e.target.selectionStart = e.target.selectionEnd = cursorPos + 1;
        }, 0);
      } else {
        e.preventDefault();
        handleSend(input);
      }
    }
  };

  const handleEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="flex mx-8 my-4 p-4 bg-stone-800 items-end relative">
      {/* Emoji Button */}
      <button
        type="button"
        onClick={() => setShowEmojiPicker((prev) => !prev)}
        className="mr-2 px-3 py-2 bg-black text-white border border-transparent hover:border-white flex-shrink-0"
      >
        <div className="text-2xl">😀</div>
      </button>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          e.target.style.height = "auto";
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
        onKeyDown={(e) => handleKeyPress(e)}
        rows={1}
        style={{ overflow: "hidden" }}
        className="flex-1 resize-none px-4 text-xl py-3 h-12 focus:border text-white bg-black outline-none"
        placeholder="Type a message..."
      />

      {/* Send Button */}
      <button
        onClick={() => handleSend(input)}
        className="ml-2 px-4 py-2 h-12 bg-black text-white border border-transparent hover:border-white text-xl flex-shrink-0 outline-none"
      >
        Send
      </button>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-0 z-50">
          <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
        </div>
      )}
    </div>
  );
}
