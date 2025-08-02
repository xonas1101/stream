function Loader() {
  return (
    <div className="flex gap-1 items-end">
      <p className="text-5xl">Loading</p>{" "}
      <div className="animate-bounce [animation-delay:0s] text-3xl">.</div>
      <div className="animate-bounce [animation-delay:0.2s] text-3xl">.</div>
      <div className="animate-bounce [animation-delay:0.4s] text-3xl">.</div>
    </div>
  );
}

export default Loader;
