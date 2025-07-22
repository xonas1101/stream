import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./Layouts/Layout";
import Landing from "./pages/Landing";

function App() {
  return (
    <div className="min-h-screen min-w-screen text-white font-bitcount">
      <Routes>
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
        </Route>
        <Route path="/" element={<Landing />} />
      </Routes>
    </div>
  );
}

export default App;
