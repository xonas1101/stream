function Sidebar() {
  return (
    <div className="flex flex-col h-screen justify-between">
      <div>
        <div className="flex gap-4 items-start pb-4 hover:underline decoration-dotted">
          <img src="./home.svg" className="w-6" />
          <p className="text-2xl hover:underline decoration-dotted">Home</p>
        </div>

        <div className="flex gap-4 items-start pb-4 hover:underline decoration-dotted">
          <img src="./history.svg" className="w-6" />
          <p className="text-2xl hover:underline decoration-dotted">History</p>
        </div>

        <div className="flex gap-4 items-start pb-4 hover:underline decoration-dotted">
          <img src="./trending.svg" className="w-6" />
          <p className="text-2xl hover:underline decoration-dotted">Trending</p>
        </div>

        <div className="flex gap-4 items-start pb-4 hover:underline decoration-dotted">
          <img src="./saved.svg" className="w-8" />
          <p className="text-2xl hover:underline decoration-dotted">Saved</p>
        </div>

        <div className="flex gap-4 items-start pb-4 hover:underline decoration-dotted">
          <img src="./liked.svg" className="w-8" />
          <p className="text-2xl hover:underline decoration-dotted">Liked</p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
