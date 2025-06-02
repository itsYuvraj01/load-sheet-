import { useMsal } from "@azure/msal-react";
// import "./Login.css";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../authConfig";
import axios from "axios";
import Environment from "../Environment";
import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "../component/Spinner";
// import { useGoogleLogin } from "@react-oauth/google";
import  secureLocalStorage  from  "react-secure-storage";
const Login = () => {
  const [loading,setLoading] = useState(false);
  const { instance } = useMsal();                              //instance of microsoft login
  const navigate = useNavigate();                              //used to move from one page to another
  const [user, setUser] = useState("");                        //used to store login response of api after login
  const [stationCode, setStationCode] = useState("");          //used to store login response of api after login
  const user1 = useRef();
  const [ipAddress,setIpAddress] = useState("");
  const fetchApi = async () => {
    try {
      const response = await fetch('https://api.ipify.org');
      const data = await response.text();
      setIpAddress(data);
      secureLocalStorage.setItem("IP",data)
    } catch (error) {
      console.log("Error in fetching ip address");
    }
  }

  useEffect(()=> {fetchApi()},[])
  // microsoft login functionality
  const handleLogin = async () => {
    setLoading(true);
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
      // secureLocalStorage.setItem("accessToken", response.accessToken);
      const email = response.account?.username;
      if (!email) {
        toast("Login failed: Email not found.");
        setLoading(false);
        return;
      }
      const apiResponse = await axios.post(
        `${Environment.BaseAPIURL}/CheckLoginByFlightCode`,
        {
          UserId: email,
          "LoginSource":"P"
        }
      );
      console.log("API Response:", apiResponse);
      if (apiResponse?.data?.responseMessage === "Login Success") {
        setUser(apiResponse?.data?.userId);
        // user1.current = apiResponse?.data?.userId;
        user1.current = apiResponse?.data?.id;
        setStationCode(apiResponse?.data?.stationCode);
        // toast.success("User logged in successfully");
        secureLocalStorage.setItem("UID",apiResponse?.data?.id);
        secureLocalStorage.setItem("userId",apiResponse?.data?.userId);
        secureLocalStorage.setItem("isAuthenticated", "true");
        const expiryTime = new Date().getTime() + 15*60*1000;
        secureLocalStorage.setItem("sessionTimeOut",expiryTime);
        secureLocalStorage.setItem("Permissions",apiResponse?.data?.details)
        const userPermissions = apiResponse?.data?.details || [];
        localStorage.setItem("loginType", "microsoft");
         if (userPermissions.some(p => p === "Dashboard")) {
             navigate("/Dashboard");
           } else {
             navigate("/welcome");
           }
        // console.log("Obj",obj)
        try {
          const insertData = await axios.post(`${Environment.BaseAPIURL}/InsertAuditReport`,{
             "IpAddress": ipAddress,
             "Action": "Login",
             "ProcessName": "Logged in successfully",
             "UserId": user1.current,
             "CreatedBy": user1.current,
             "TemplateId": "Login"
          })
          console.log("response insert in audit",insertData?.data?.response);
          // console.log("Obj",obj)
          setLoading(false);
        } catch (error) {
          console.log("error in sending data",error);
          setLoading(false)
        }
      } 
      else if(apiResponse?.data?.responseMessage === "User does not have permission to login from this source.") {
         toast.error("Device user can not login to Portal", {
          autoClose: 5000,
        });
         try {
          const insertData = await axios.post(`${Environment.BaseAPIURL}/InsertAuditReport`,{
             "IpAddress": ipAddress,
             "Action": "Login",
             "ProcessName": "Device user login failed",
             "UserId": user1.current,
             "CreatedBy": user1.current,
             "TemplateId": "Login"
          })
          console.log("response insert in audit",insertData?.data?.response);
          setLoading(false);
        } catch (error) {
          console.log("error in sending data",error);
          setLoading(false);
        }
        const account = response.account;
        await instance.logoutPopup({
          postLogoutRedirectUri: "http://localhost:3000/",
          // postLogoutRedirectUri: "https://maxdemo.maxworth.in/",
          account,
        });
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
        setLoading(false);
      }
    } catch (error) {
      console.error("Login failed:", error);
      setLoading(false);
    }
  };

  return (
    <>{ loading && <Spinner/>   }
    <div
      className="login-container"
      style={{
        backgroundImage: "url('/images/bg1.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="animated-text">Welcome to AIX LOAD SHEET Portal</div>
      <div className="login-box">
        <div className="login-left">
          <img src="images/AirIndiaExpress.png" alt="Air India Express Logo" className="login-logo" />
        </div>
        <div className="login-right">
          <div className="login-logo-image">
            <img src="images/plane.png" alt="" style={{ height: "100%", width: "100%" }} />
          </div>
          <h2>Welcome to Air India Express</h2>
          <p> To continue, please login with your official AIX Email ID </p>
          {/* Microsoft Login Button */}
          <button className="login-button" onClick={handleLogin}>
            <div style={{ height: "20px",width: "20px", display: "flex",alignItems: "center",justifyContent: "center",}}>
              <img src="/images/favicon.jpg" alt="" style={{ height: "100%", width: "100%" }}/>
            </div>
            Log in with AIX Email ID
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
    </>
  );
};

export default Login;
