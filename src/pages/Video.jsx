import Navbar from "../components/Navbar";

function Video() {
  return (
    <>
      <Navbar />
      <div className="h-screen w-[100%] flex gap-12">
        <div className="flex flex-col gap-4 mt-12 ml-12">
          <div className="w-[60vw] h-[33.375vw] rounded-2xl  border-4 border-white"></div>
          <div className="flex justify-between">
            <h1 className="text-3xl">TITLE OF VIDEO</h1>
            <div className="text-3xl">
              STATS:<span>LOTS_OF_STATS</span>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-8">
          <div className="w-[20vw] h-[15.8vw]  rounded-2xl border-4 border-white"></div>
          <div className="w-[20vw] h-[15.8vw] border-4 rounded-2xl border-white"></div>
        </div>
      </div>
    </>
  );
}

export default Video;
