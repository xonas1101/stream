import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Create socket but don't auto-connect yet
    const newSocket = io(`${import.meta.env.VITE_BACKEND_URL}`, {
      withCredentials: true,
      autoConnect: false, // prevents connection until manually triggered
    });

    // Attach socket instance
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/me`, {
        credentials: "include",
      })
        .then((res) => {
          if (res.ok) {
            socket.connect(); // connect after session is confirmed
          }
        })
        .catch((err) => {
          console.error("Session check failed, not connecting socket:", err);
        });
    }
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
