import { useMsal } from "@azure/msal-react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../authConfig";
import axios from "axios";
import Environment from "../Environment";
import { useState } from "react";
import { ToastContainer, toast ,Bounce} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Login = () => {
  const { instance } = useMsal();
  const navigate = useNavigate()
  const [user,setUser] = useState("");
  const [stationCode,setStationCode] = useState("");

  const handleLogin = async () => {
  try {
    localStorage.clear();

    // 1. Logout all existing accounts to clear MSAL cache
    const accounts = instance.getAllAccounts();
    for (const account of accounts) {
      await instance.logoutPopup({
        postLogoutRedirectUri: "http://localhost:3000/",
        // postLogoutRedirectUri: "http://192.168.2.8:667/",
        account,
      });
    }

    // 2. Force fresh login with prompt
    const response = await instance.loginPopup({
      ...loginRequest,
      prompt: "select_account", // Forces account chooser
    });

    console.log("Full login response:", response);

    const email = response.account?.username;

    if (!email) {
      alert("Login failed: Email not found.");
      return;
    }

    // 3. Check if user exists in DB
    const apiResponse = await axios.post(`${Environment.BaseAPIURL}/CheckLoginByFlightCode`, {
      userId: email,
    });

    console.log("API Response:", apiResponse);

    if (apiResponse?.data?.responseMessage === "Login Success") {
      setUser(apiResponse?.data?.userId);
      setStationCode(apiResponse?.data?.stationCode);
      toast.success("User logged in successfully  ")
      navigate("/Dashboard");
    } else {
      // alert("User does not exist");
      toast.error("User is not registered ! Please contact to administrator",{
        autoClose:5000
      })
      // 4. Logout again to ensure cache is cleared
      const account = response.account;
      await instance.logoutPopup({
        postLogoutRedirectUri: "http://localhost:3000/",
        // postLogoutRedirectUri: "http://192.168.2.8:667/",
        account,
      });
    }
  } catch (error) {
    console.error("Login failed:", error);
    // if (!error.errorMessage?.includes("AADB2C90118")) {
    //   alert("Login failed. Please try again.");
    // }
  }
};


  return (
    <div className="login-container">
      <div className="animated-text">Welcome to AIX LOAD SHEET Portal</div>
      <div className="login-box">
        <div className="login-left">
          <img
            // src="/images/AirIndiaExpress.png"
            src="images/leftimage.jpg"
            alt="Air India Express Logo"
            className="login-logo"
          />
        </div>
        <div className="login-right">
          <div className="login-logo-image"><img src="/images/logoimae-removebg-preview.png" alt="" style={{height:"100%",width:"100%"}}/></div>
          <h2>Welcome to Air India Express</h2>
          <p>To continue, please log in using your Microsoft or Google account.</p>
          <button className="login-button" onClick={handleLogin}>
            <div style={{height:"20px", width:"20px",display:"flex",alignItems:"center",justifyContent:"center"}}><img src="/images/microsoft.png" alt="" style={{height:"100%",width:"100%"}}/></div>
            Log in with Microsoft
          </button>
          <button className="login-button" onClick={handleLogin}>
            <div style={{height:"20px", width:"20px",display:"flex",alignItems:"center",justifyContent:"center"}}><img src="/images/google.png" alt="" style={{height:"100%",width:"100%"}}/></div>
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
