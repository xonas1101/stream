import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./Layouts/Layout";
import Landing from "./pages/Landing";
import MarioFollower from "./ui/MarioFollower.jsx";
import Video from "./pages/Video.jsx";
import NotFound from "./pages/NotFound.jsx";

function App() {
  console.log(import.meta.env.VITE_OAUTH_CLIENT_ID);
  return (
    <div className="min-h-screen min-w-screen text-white font-bitcount">
      <MarioFollower />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
        </Route>
        <Route path="/" element={<Landing />} />
        <Route path="/video/:id" element={<Video />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
