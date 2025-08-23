import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./Layouts/Layout";
import Landing from "./pages/Landing";
import MarioFollower from "./ui/MarioFollower.jsx";
import Video from "./pages/Video.jsx";
import SearchResultsPage from "./pages/SearchResultsPage.jsx";
import NotFound from "./pages/NotFound.jsx";
import RoomPage from "./pages/RoomPage.jsx";
import Liked from "./pages/Liked.jsx";
import Saved from "./pages/Saved.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Trending from "./pages/Trending.jsx";
import UserPage from "./pages/UserPage.jsx";
// import AuthCallback from "./pages/AuthCallback.jsx";

function App() {
  return (
    <div className="min-h-screen min-w-screen text-white font-bitcount">
      <MarioFollower />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/liked" element={<Liked />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/search" element={<SearchResultsPage />} />
        </Route>
        <Route path="/room/:roomId" element={<RoomPage />} />
        <Route path="/" element={<Landing />} />
        <Route path="/video/:id" element={<Video />} />
        {/* <Route path="/auth/callback" element={<AuthCallback />} /> */}
        <Route path="/userpage" element={<UserPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
