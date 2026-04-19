import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useSocket } from "./context/socketContext.jsx";
import { toast } from "react-toastify";
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
import ProtectedRoute from "./components/ProtectedRoutes.jsx";
import { WebRTCProvider } from "./context/WebRTCContext.jsx";
// import AuthCallback from "./pages/AuthCallback.jsx";

function GlobalChatListener() {
  const socket = useSocket();
  const location = useLocation();

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (msg) => {
      // Show notification only if not on room or video page
      const isOnChatPage = location.pathname.startsWith("/room/") || location.pathname.startsWith("/video/");
      
      if (!isOnChatPage) {
        toast.info(`💬 ${msg.name}: ${msg.text}`, {
          autoClose: 3000,
        });
      }
    };

    socket.on("receive-message", handleMessage);
    return () => socket.off("receive-message", handleMessage);
  }, [socket, location.pathname]);

  return null;
}

function App() {
  return (
    <div className="min-h-screen min-w-screen text-white font-bitcount">
      <WebRTCProvider>
        <GlobalChatListener />
        <MarioFollower />
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/home" element={<Home />} />
            <Route path="/liked" element={<Liked />} />

            <Route path="/trending" element={<Trending />} />
            <Route path="/search" element={<SearchResultsPage />} />
          </Route>

          <Route
            path="/room/:roomId"
            element={
              <ProtectedRoute>
                <RoomPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/video/:id"
            element={
              <ProtectedRoute>
                <Video />
              </ProtectedRoute>
            }
          />

          <Route
            path="/userpage"
            element={
              <ProtectedRoute>
                <UserPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </WebRTCProvider>
    </div>
  );
}

export default App;
