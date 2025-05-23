import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';
import { useMsal } from "@azure/msal-react";
import { googleLogout } from '@react-oauth/google';

const Navbar = () => {
  const [openReport, setOpenReport] = useState(false);
  const [openAdmin, setOpenAdmin] = useState(false);
  const navigate = useNavigate();
  const reportRef = useRef();
  const adminRef = useRef();

  // to open and autoclose the list below administration and report 
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        reportRef.current && !reportRef.current.contains(e.target) &&
        adminRef.current && !adminRef.current.contains(e.target)
      ) {
        setOpenReport(false);
        setOpenAdmin(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

    if (loginType === "google") {
      console.log(googleLogout(), 64)
      // googleLogout();
      window.open("https://accounts.google.com/Logout", "_self");
      navigate("/");
    } else if (loginType === "microsoft") {
      await instance.logoutPopup({ postLogoutRedirectUri: "/" });
      navigate("/");
    } else {
      // fallback: unknown login type
      navigate("/");
    }
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

  return (
    <div className="navbar">
      <div className="main-navbar">
        <div className="image-container">
          <img src="/images/AirIndiaExpress.png" alt="Airline Express Logo" className="logo" />
        </div>
        {/* <div className="nav-heading">AIX LOAD SHEET</div> */}
        <div className="pages-link">
          <div className="page-link" onClick={() => navigate("/Dashboard")}>
            <span>Dashboard</span>
          </div>

          <div className="page-link-2" onClick={handleAdminClick} ref={adminRef}>
            <span>Administration ▾</span>
            {openAdmin && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={() => navigate("/Add-Role")}>
                  Add Role
                </div>
                <div className="dropdown-item" onClick={() => navigate("/Add-User")}>
                  Add User
                </div>
              </div>
            )}
          </div>

          <div className="page-link-2" onClick={handleReportClick} ref={reportRef}>
            <span>Reports ▾</span>
            {openReport && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={() => navigate("/LoadSheetReport")}>
                  Load Sheet Details
                </div>
              </div>
            )}
          </div>
        {/*  <div onClick={handleLogOut}>logout</div>*/} 
        <div className="page-link" onClick={handleLogOut}>
            <span>Logout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
