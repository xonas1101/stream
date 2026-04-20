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
    <div className="flex gap-2 items-center w-full max-w-xl group relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
        <img src="/search.svg" alt="Search" className="w-5 h-5 opacity-40 group-focus-within:opacity-100 transition-opacity" />
      </div>
      <input
        type="text"
        placeholder="Search for videos..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        className="w-full bg-stone-900/80 border border-stone-800 text-stone-100 text-lg h-12 pl-12 pr-4 rounded-full focus:outline-none focus:ring-2 focus:ring-stone-600 focus:bg-stone-800/80 transition-all placeholder-stone-500 shadow-inner"
      />
    </div>
  );
}

export default Search;
