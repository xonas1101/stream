import { useNavigate } from "react-router-dom";

function User() {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate("/userpage")}
      className="cursor-pointer hover:bg-stone-800 p-2 rounded-full transition-colors flex items-center justify-center shrink-0"
      title="Profile"
    >
      <img src="/user.svg" alt="profile" className="w-6 h-6 invert opacity-80 hover:opacity-100" />
    </div>
  );
}

export default User;
