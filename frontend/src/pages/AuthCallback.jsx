// import { useEffect } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { googleAuth } from "../api"; // your axios wrapper

// function AuthCallback() {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const code = searchParams.get("code");
//     if (code) {
//       googleAuth(code)
//         .then((res) => {
//           console.log("Google login success:", res.data);
//           navigate("/home");
//         })
//         .catch((err) => {
//           console.error("Google login failed:", err);
//           navigate("/");
//         });
//     }
//   }, []);

//   return <div>Logging you in...</div>;
// }

// export default AuthCallback;
