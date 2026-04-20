function Loader() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-full w-full py-10">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-stone-200 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-stone-400 animate-spin animation-delay-200 opacity-60"></div>
      </div>
      <p className="text-stone-400 text-sm font-medium tracking-widest uppercase animate-pulse">
        Buffering
      </p>
    </div>
  );
}

export default Loader;
