import React, { useState, useEffect, useRef } from "react";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
// import { googleLogout } from "@react-oauth/google";
import secureLocalStorage from "react-secure-storage";

const Navbar = () => {
  const [openReport, setOpenReport] = useState(false);
  const [openAdmin, setOpenAdmin] = useState(false);
  const [showModal,setShowModal] = useState(false);
  const navigate = useNavigate();
  const reportRef = useRef();
  const adminRef = useRef();
  const permissions = secureLocalStorage.getItem("Permissions");

  const hasPermission = (permissionName) => {
    return permissions && permissions.includes(permissionName);
  };
  const hasAnyPermission = (permissionList) => {
    return permissionList.some((p) => hasPermission(p));
  };
  // to open and autoclose the list below administration and report
  useEffect(() => {
    const handleClickOutside = (e) => {
      if ( reportRef.current && !reportRef.current.contains(e.target) && adminRef.current && !adminRef.current.contains(e.target)) 
        {
          setOpenReport(false); 
          setOpenAdmin(false);
        }};
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdminClick = () => {
    setOpenAdmin((prev) => !prev);
    setOpenReport(false); // close report
  };

  const handleReportClick = () => {
    setOpenReport((prev) => !prev);
    setOpenAdmin(false); // close admin
  };

  // logout functionality
  const { instance } = useMsal();
  const handleLogOut = async () => {
    const loginType = localStorage.getItem("loginType");
    try {
      localStorage.clear();
      sessionStorage.clear();
      secureLocalStorage.removeItem("isAuthenticated");
      secureLocalStorage.removeItem("sessionTimeOut");
      if (loginType === "microsoft") {
        await instance.logoutPopup({ postLogoutRedirectUri: "/" });
        navigate("/");
        setShowModal(false);
      } else {
        // fallback: unknown login type
        navigate("/");
        setShowModal(false);
      }
    } catch (error) {
      console.error("Logout failed:", error);
      setShowModal(false);
    }
  };

  return (
    <div className="navbar">
      <div className="main-navbar">
        <div className="image-container">
          <img
            src="/images/AirIndiaExpress.png"
            alt="Airline Express Logo"
            className="logo"
          />
        </div>
        {/* <div className="nav-heading">AIX LOAD SHEET</div> */}
        <div className="pages-link">
          {hasPermission("Dashboard") && (
            <div className="page-link" onClick={() => navigate("/Dashboard")}>
              <span>Dashboard</span>
            </div>
          )}

          {hasAnyPermission(["Add User", "Add Role","Add Organisation"]) && (
            <div className="page-link-2" onClick={handleAdminClick} ref={adminRef} >
              <span>Administration ▾</span>
              {openAdmin && (
                <div className="dropdown-menu">
                  {hasPermission("Add Role") && (
                    <div className="dropdown-item" onClick={() => navigate("/Add-Role")} > Add Role </div>
                  )}
                  {hasPermission("Add User") && (
                    <div className="dropdown-item" onClick={() => navigate("/Add-User")} > Add User </div>
                  )}
                  {hasPermission("Add Organisation") && (
                  <div className="dropdown-item" onClick={() => navigate("/Add-Vendor")}> Add Organisation </div>
                  )}
                </div>
              )}
            </div>
          )}

          {hasAnyPermission(["Load Sheet Details", "AuditReport"]) && (
            <div className="page-link-2" onClick={handleReportClick} ref={reportRef}>
              <span>Reports ▾</span>
              {openReport && (
                <div className="dropdown-menu">
                  {hasPermission("Load Sheet Details") && (
                    <div className="dropdown-item" onClick={() => navigate("/LoadSheetReport")} > Load Sheet Details </div>
                  )}
                  {hasPermission("AuditReport") && (
                  <div className="dropdown-item" onClick={() => navigate("/AuditReport")}> Audit Report </div>
                  )}
                  {hasPermission("Load Sheet Image Report") && (
                  <div className="dropdown-item" onClick={() => navigate("/ImageReport")}>Load Sheet Image Report</div>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="page-link" onClick={()=>{setShowModal(true)}}
          // onClick={handleLogOut}
          >
            <span>Logout</span>
          </div>
        </div>
      </div>
      {showModal && <div className="delete-Modal-overLay">
            <div className="delete-modal-content">
            <div className="warning-image"><img src="/images/warning.png" alt="" style={{height:"100%",width:"100%"}}/></div>
            <div className="text-para">Are you sure you want to logout!</div>
            <div className="delete-modal-buttons">
              <button className="yes-button" onClick={handleLogOut}>Yes</button>
              <button className="no-button" onClick={() => setShowModal(false)}>No</button>
            </div>
          </div>
          </div>}
    </div>
  );
};

export default Navbar;
