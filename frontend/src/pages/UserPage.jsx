import axios from "axios";
import { useEffect, useState } from "react";

function UserPage() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    axios
      .get("http://localhost:5000/auth/me", { withCredentials: true })
      .then((res) => {
        console.log("User:", res.data);
        setUser(res.data);
      })
      .catch((err) => {
        console.log("Not logged in", err);
      });
  }, []);

  return (
    <div className="flex flex-col gap-2 mb-2">
      {user ? (
        <>
          <img
            src={user.picture}
            alt={user.name}
            className="rounded-full w-24 h-24 mx-auto"
          />
          <p className="text-center font-semibold">{user.name}</p>
          <p className="text-center text-gray-600">{user.email}</p>
        </>
      ) : (
        <p className="text-center text-gray-500">Loading user info...</p>
      )}
    </div>
  );
}

export default UserPage;
