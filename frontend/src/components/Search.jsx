import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Search() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    const trimmed = query.trim();
    if (trimmed.length > 0) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className="flex gap-2 items-center w-full max-w-xl">
      <input
        type="text"
        placeholder="Browse videos..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        className="flex-grow bg-black border-4 border-dotted border-white text-2xl h-12 focus:outline-none focus:ring-0 p-2 text-white placeholder-gray-400 w-full"
      />
      <button
        onClick={handleSearch}
        className="border-4 border-white border-dotted p-1 inline-flex justify-center items-center cursor-pointer"
        aria-label="Search"
      >
        <img src="/search.svg" alt="Search icon" className="w-8 h-8" />
      </button>
    </div>
  );
}

export default Search;
