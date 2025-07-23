import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

function LoginCard({ fadeOut }) {
  const navigate = useNavigate();
  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/google", {
        credential: credentialResponse.credential,
      });
      console.log("User logged in:", res.data.user);
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogin = () => {
    navigate("/home");
  };

  return (
    <div
      className={`border-2  px-8 py-8 w-[25%] border-solid rounded-lg  items-center flex flex-col gap-12 border-white absolute top-[20%] left-[55%] text-2xl ${
        fadeOut ? "animate-zoomIn" : "hidden"
      }`}
    >
      <h1 className="text-5xl">Sign in via Google</h1>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => {
          console.log("Login Failed!");
        }}
      />
      <h2 className="text-3xl">
        Custom login under maintenance. Check back later!
      </h2>

      {/* <input
        type="text"
        placeholder="Username or E-mail"
        className="bg-black border-4 border-dotted border-white h-12 focus:outline-none focus:ring-0 focus:border-dotted w-[95%]"
      />
      <input
        type="text"
        placeholder="Password"
        className="bg-black border-4 border-dotted border-white h-12 focus:outline-none focus:ring-0 focus:border-dotted w-[95%]"
      />
      <button
        className="p-4 bg-white rounded-lg text-black inline-block w-[95%]"
        onClick={handleLogin}
      >
        Sign In
      </button>
      <div className="flex justify-between w-[95%]">
        <p className="text-xl cursor-default">
          New Here?{" "}
          <button className="hover:underline decoration-dotted">SignUp</button>
        </p>
        <button className="text-xl hover:underline decoration-dotted">
          Raise Issues
        </button> */}
      {/* </div> */}
    </div>
  );
}

export default LoginCard;
