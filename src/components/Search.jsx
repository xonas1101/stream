function Search() {
  return (
    <div className="flex gap-2 items-center">
      <input
        type="text"
        placeholder="Browse videos..."
        className="bg-black border-4 border-dotted border-white text-2xl h-12 focus:outline-none focus:ring-0 focus:border-dotted p-2"
      />
      <span className="border-4 border-white border-dotted inline-flex justify-center items-center cursor-pointer">
        <img src="/search.svg" alt="magnifying glass" className="w-10" />
      </span>
    </div>
  );
}

export default Search;
