import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function Layout() {
  return (
    <>
      <Navbar />
      <div className="flex h-screen overflow-hidden">
        <aside className="pl-8 py-4 h-screen w-[15%]">
          <Sidebar />
        </aside>
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default Layout;
