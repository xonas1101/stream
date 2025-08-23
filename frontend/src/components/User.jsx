import { useNavigate } from "react-router-dom";

function User() {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate("/userpage")}>
      <img src="/user.svg" alt="profile" className="w-16" />
    </div>
  );
}

export default User;
