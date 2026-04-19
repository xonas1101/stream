import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const [isAuth, setIsAuth] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/me`, {
          credentials: "include",
        });
        if (res.ok) {
          setIsAuth(true);
          sessionStorage.removeItem("returnTo");
        } else {
          setIsAuth(false);
          sessionStorage.setItem("returnTo", location.pathname);
        }
      } catch {
        setIsAuth(false);
        sessionStorage.setItem("returnTo", location.pathname);
      }
    };
    checkAuth();
  }, [location.pathname]);

  if (isAuth === null)
    return <div className="text-white">Checking login...</div>;

  return isAuth ? children : <Navigate to="/" />;
}
