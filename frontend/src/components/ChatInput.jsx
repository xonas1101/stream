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
    <div className="flex mx-2 my-2 px-3 py-2 bg-stone-800 rounded-xl items-end relative border border-stone-700/50 shadow-sm focus-within:border-stone-500/50 focus-within:ring-2 focus-within:ring-stone-500/20 transition-all">
      {/* Emoji Button */}
      <button
        type="button"
        onClick={() => setShowEmojiPicker((prev) => !prev)}
        className="mr-2 p-2 h-9 w-9 flex items-center justify-center text-stone-400 hover:text-stone-200 hover:bg-stone-700/50 rounded-lg transition-colors flex-shrink-0 leading-none outline-none relative bottom-[2px]"
      >
        <span className="text-xl leading-none">😀</span>
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
        style={{ overflow: "hidden", minHeight: "36px", maxHeight: "150px" }}
        className="flex-1 min-w-0 resize-none px-2 text-[15px] py-1.5 focus:border-none text-stone-100 bg-transparent outline-none placeholder-stone-500 custom-scrollbar leading-relaxed"
        placeholder="Type a message..."
      />

      {/* Send Button */}
      <button
        onClick={() => handleSend(input)}
        disabled={!input.trim()}
        className="ml-2 p-2 h-9 w-9 bg-stone-700 hover:bg-stone-600 disabled:bg-stone-800 disabled:text-stone-500 text-stone-200 rounded-lg transition-colors flex items-center justify-center flex-shrink-0 outline-none relative bottom-[2px] shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 translate-x-[1px]">
          <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
        </svg>
      </button>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-full left-0 mb-4 z-50 shadow-2xl rounded-2xl overflow-hidden border border-stone-700/50">
          <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" width={300} height={400} />
        </div>
      )}
    </div>
  );
}
