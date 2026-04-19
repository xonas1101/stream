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
        e.stopPropagation();
        const cursorPos = e.target.selectionStart;
        const textBefore = input.substring(0, cursorPos);
        const textAfter = input.substring(cursorPos);
        setInput(textBefore + "\n" + textAfter);
        setTimeout(() => {
          e.target.selectionStart = e.target.selectionEnd = cursorPos + 1;
        }, 0);
      } else {
        e.preventDefault();
        e.stopPropagation();
        handleSend(input);
      }
    }
  };

  const handleEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="flex mx-2 my-2 px-3 py-2 bg-stone-800 items-center relative">
      {/* Emoji Button */}
      <button
        type="button"
        onClick={() => setShowEmojiPicker((prev) => !prev)}
        className="mr-1 p-1.5 h-10 bg-black text-white border border-transparent hover:border-white flex-shrink-0 leading-none"
      >
        <span className="text-base leading-none">😀</span>
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
        style={{ overflow: "hidden", height: "40px" }}
        className="flex-1 min-w-0 resize-none px-2 text-base py-2 focus:border text-white bg-black outline-none"
        placeholder="Type a message..."
      />

      {/* Send Button */}
      <button
        onClick={() => handleSend(input)}
        className="ml-1 px-3 py-1 h-10 bg-black text-white border border-transparent hover:border-white text-base flex-shrink-0 outline-none"
      >
        Send
      </button>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-0 z-50">
          <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" width={260} height={320} />
        </div>
      )}
    </div>
  );
}
