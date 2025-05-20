import { useMsal } from "@azure/msal-react";
// import "./Login.css";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../authConfig";
import axios from "axios";
import Environment from "../Environment";
import { useState } from "react";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useGoogleLogin } from "@react-oauth/google";

const Login = () => {
  const { instance } = useMsal();                              //instance of microsoft login
  const navigate = useNavigate();                              //used to move from one page to another
  const [user, setUser] = useState("");                        //used to store login response of api after login
  const [stationCode, setStationCode] = useState("");          //used to store login response of api after login

  // google login button functionality
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const accessToken = tokenResponse.access_token;
        // Fetch Google user info using access token
        const { data } = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        // console.log("Google login success:", data);
        const email = data.email;
        const response = await axios.post(
          `${Environment.BaseAPIURL}/CheckLoginByFlightCode`,
          {
            userId: email,
          }
        );
        if (response.data.responseMessage === "Login Success") {
          toast.success("User logged in successfully");
          localStorage.setItem("loginType", "google");
          navigate("/Dashboard");
        } else {
          toast.error("User is not registered! Please contact administrator");
        }
      } catch (err) {
        console.error("Google login error:", err);
        toast.error("Something went wrong during Google login");
      }
    },
    onError: () => {
      console.log("Google login failed");
      toast.error("Google login failed");
    },
    prompt: "select_account",
    ux_mode: "popup",
  });

  // microsoft login functionality
  const handleLogin = async () => {
    try {
      localStorage.clear();
      const accounts = instance.getAllAccounts();
      for (const account of accounts) {
        await instance.logoutPopup({
          postLogoutRedirectUri: "http://localhost:3000/",
          // postLogoutRedirectUri: "https://maxdemo.maxworth.in/",
          account,
        });
      }
      const response = await instance.loginPopup({
        ...loginRequest,
        prompt: "select_account",
      });
      // console.log("Full login response:", response);
      const email = response.account?.username;
      if (!email) {
        alert("Login failed: Email not found.");
        return;
      }
      const apiResponse = await axios.post(
        `${Environment.BaseAPIURL}/CheckLoginByFlightCode`,
        {
          userId: email,
        }
      );
      // console.log("API Response:", apiResponse);
      if (apiResponse?.data?.responseMessage === "Login Success") {
        setUser(apiResponse?.data?.userId);
        setStationCode(apiResponse?.data?.stationCode);
        toast.success("User logged in successfully");
        localStorage.setItem("loginType", "microsoft");
        navigate("/Dashboard");
      } else {
        toast.error("User is not registered! Please contact administrator", {
          autoClose: 5000,
        });
        const account = response.account;
        await instance.logoutPopup({
          postLogoutRedirectUri: "http://localhost:3000/",
          // postLogoutRedirectUri: "https://maxdemo.maxworth.in/",
          account,
        });
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div
      className="login-container"
      style={{
        backgroundImage: "url('/images/bg1.jpg')",
        // backgroundImage: "url('/images/bg.jpg')",
        // backgroundImage: "url('/images/aix.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="animated-text">Welcome to AIX LOAD SHEET Portal</div>
      <div className="login-box">
        <div className="login-left">
          <img
            // src="images/leftimage.jpg"
            src="images/AirIndiaExpress.png"
            alt="Air India Express Logo"
            className="login-logo"
          />
        </div>
        <div className="login-right">
          <div className="login-logo-image">
            <img
              src="/images/logoimae-removebg-preview.png"
              alt=""
              style={{ height: "100%", width: "100%" }}
            />
          </div>
          <h2>Welcome to Air India Express</h2>
          <p>
            To continue, please log in using your Microsoft or Google account.
          </p>

          {/* Microsoft Login Button */}
          <button className="login-button" onClick={handleLogin}>
            <div
              style={{
                height: "20px",
                width: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src="/images/microsoft.png"
                alt=""
                style={{ height: "100%", width: "100%" }}
              />
            </div>
            Log in with Microsoft
          </button>

          {/* Google Login Button */}
          <button className="login-button" onClick={() => googleLogin()}>
            <div
              style={{
                height: "20px",
                width: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src="/images/google.png"
                alt="Google"
                style={{ height: "100%", width: "100%" }}
              />
            </div>
            Log in with Google
          </button>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </div>
  );
};

export default Login;
