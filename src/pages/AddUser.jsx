import React, { lazy, Suspense, useEffect, useState } from "react";
import PopUpModal from "../component/PopUpModal";
import "../component/Footer.css";
import "../component/Navbar.css";
import "./AddUser.css";
// import { FaUser } from "react-icons/fa";
// import {MdMarkEmailUnread,MdSettingsApplications,MdDeleteForever,} from "react-icons/md";
// import { MdOutlineLocalAirport } from "react-icons/md";
// import { IoCloudUploadSharp, IoSearchSharp } from "react-icons/io5";
// import { GrUserWorker } from "react-icons/gr";/
// import { FaEdit } from "react-icons/fa";
import Switch from "react-switch";
import axios from "axios";
import Environment from "../Environment";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "../component/Spinner";
import Dropzone from "react-dropzone";
import * as XLSX from "xlsx";
import secureLocalStorage from "react-secure-storage";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faUser,faMagnifyingGlass,faEnvelope,faPlaneUp,faUserTie,faBuildingNgo,faDesktop,faPenToSquare,faTrash} from '@fortawesome/free-solid-svg-icons';
const Navbar = lazy(() => import("../component/Navbar"));
const Footer = lazy(() => import("../component/Footer"));

const AddUser = () => {
  const [name, setName] = useState(""); //to store the name of user
  const [email, setEmail] = useState(""); //to store the email of user
  const [empId, setEmpId] = useState(""); //to store the mobile number of user
  const [station, setStation] = useState(""); //to store the station for which user is created
  const [app, setApp] = useState(""); // to store the application permission for user ---> added new
  const [permissionData, setPermissionData] = useState([]);
  const [orgnisation, setOrganisation] = useState("");
  const [organisationData, setOrganisationData] = useState([]);
  const [stationData, setStationData] = useState([]); // station dropdown data
  const [tableData, setTableData] = useState([]); // it stores the all users data in table
  const [filterData, setFilterData] = useState([]); //it stores the filtered data when using search
  const [status, setStatus] = useState(1); // active inactive status
  const [searchTerm, setSearchTerm] = useState(""); // it is used for searching pupose
  const [editingIndex, setEditingIndex] = useState(null); // it keeps track of which data is updating
  const [userData1, setUserData1] = useState([]); //  it is used to check stored user data duplicacy email
  const [emailError, setEmailError] = useState(""); // this is used for email error -> email already exist
  const [loading, setLoading] = useState(false); // loader enabled when api called
  const [role, setRole] = useState("");
  const [roleData, setRoleData] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [excelError, setExcelError] = useState("");
  const [fileData, setFileData] = useState([]);
  const [userIDError, setUserIDError] = useState("");
  const [matchedData, setMatchedData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [duplicatesDeleted, setDuplicatesDeleted] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [showPopUpModal,setShowPopUpModal] = useState(false);
  const [text,setText] = useState("");
  const [showDeleteModal,setShowDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserIndex, setSelectedUserIndex] = useState(null);
  const userId = secureLocalStorage.getItem("userId")
  const IpAddress = secureLocalStorage.getItem("IP")
  const Uid = secureLocalStorage.getItem("UID");
  // Api calling for all the data which loads on page render
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const userRes = await axios.post(
          `${Environment.BaseAPIURL}/GetUserUpdateData`, {Action: "GetReportUser"});
        const stationRes = await axios.post(
          `${Environment.BaseAPIURL}/GetDestDropdownbind`, {action: "GetActiveDestinations"});
        const roleRes = await axios.post(
          `${Environment.BaseAPIURL}/GetRolenameAndData`, {Action: "RoleName"});
        const appPermissionRes = await axios.post(
          `${Environment.BaseAPIURL}/GetPortalDvcDrpbind`,{action: "PortalDeviceList"});
        const orgRes = await axios.post(
          `${Environment.BaseAPIURL}/GetPortalDvcDrpbind`,{action: "OrganizationList"});
        const userresponse = Array.isArray(userRes?.data) ? userRes?.data : [];
        const stationresponse = Array.isArray(stationRes?.data) ? stationRes?.data : [];
        const rolesresponse = Array.isArray(roleRes?.data) ? roleRes?.data : [];
        const appresponse = Array.isArray(appPermissionRes?.data) ? appPermissionRes?.data : [];
        const orgresponse = Array.isArray(orgRes?.data) ? orgRes?.data : [];
        // set user table data
        setTableData(userresponse);
        setFilterData(userresponse);
        setUserData1(userresponse);
        // set the airport data dropdown
        setStationData(stationresponse);
        // set the roles data dropdown
        setRoleData(rolesresponse);
        // set the application dropdown
        setPermissionData(appresponse);
        console.log("permission data,",appresponse);
        // set the organization dropdown
        setOrganisationData(orgresponse);
      } catch (error) {
        console.error("Unexpected error in fetchAllData", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

    // searching functionality
    const handleSearch = (e) => {
      const search = e.target.value;
      setSearchTerm(search);
      if (search !== "") {
        filterTableData(search);
      } else {
        setTableData(filterData);
      }
    };
    const filterTableData = (search) => {
      const filtered = filterData.filter((loadSheet) =>
        Object.values(loadSheet).some((value) =>
          String(value).toLowerCase().includes(search.toLowerCase())
        ));
      setTableData(filtered);
    };

  // keep track of name, email, employee number, stations with their errors
  const handleNameChange = (e) => {
    setName(e.target.value);
    if (e.target.value !== "") {
      setEmptyFields((prev) => ({ ...prev, name: false }));
    }
  };
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError("");
    if (e.target.value !== "") {
      setEmptyFields((prev) => ({ ...prev, email: false }));
    }
    if (e.target.value !== "" && checkDuplicateEmail(e.target.value)) {
      setEmailError("*Email Already Exists");
    }
  };

  const handleMobileChange = (e) => {
    setEmpId(e.target.value);
    setUserIDError("");
    if (e.target.value !== "") {
      setEmptyFields((prev) => ({ ...prev, empId: false }));
    }
    if (e.target.value !== "" && checkDuplicateUserID(e.target.value)) {
      setUserIDError("*User Id already exist");
    }
  };

  const handleStationChange = (e) => {
    setStation(e.target.value);
    if (e.target.value !== "") {
      setEmptyFields((prev) => ({ ...prev, station: false }));
    }
  };
  const handleApplicationChange = (e) => {
    setApp(e.target.value);
    if (e.target.value !== "") {
      setEmptyFields((prev) => ({ ...prev, app: false }));
    }
  };

  const handleOrgnisationChange = (e) => {
    setOrganisation(e.target.value);
    if (e.target.value) {
      setEmptyFields((prev) => ({ ...prev, orgnisation: false }));
    }
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    if (e.target.value !== "") {
      setEmptyFields((prev) => ({ ...prev, role: false }));
    }
  };

  // keep track which field is empty or filled for error validations
  const [emptyFields, setEmptyFields] = useState({
    name: false,
    email: false,
    empId: false,
    station: false,
    role: false,
    app: false,
    orgnisation: false,
  });

  // clear all input and select fields
  const handleReset = () => {
    setName("");
    setEmail("");
    setEmpId("");
    setStation("");
    setRole("");
    setApp("");
    setOrganisation("");
    setEmptyFields({
      name: false,
      email: false,
      empId: false,
      station: false,
      role: false,
      // permission:false,
      app: false,
      orgnisation: false,
    });
    setEditingIndex(null);
  };

  // to check the duplicate email
  const checkDuplicateEmail = (email) => {
    return userData1.some(
      (user) => String(user.userId).toLowerCase() === email.toLowerCase()
    );
  };
  // check duplicate user ID
  const checkDuplicateUserID = (userID) => {
    const cleanedUserID = removeAllSpaces(userID); // remove all spaces
    return userData1.some(
      (user) =>
        String(user.employeeID).toLowerCase() === cleanedUserID.toLowerCase()
    );
  };

  const removeAllSpaces = (str) => {
    return str.replace(/\s+/g, "");
  };

  // submit button handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const emptyFieldsCopy = { ...emptyFields };
    let hasEmptyFiled = false;
    if (!name) {
      emptyFieldsCopy.name = true;
      hasEmptyFiled = true;
    } else {
      emptyFieldsCopy.name = false;
    }
    if (!email) {
      emptyFieldsCopy.email = true;
      hasEmptyFiled = true;
    } else {
      emptyFieldsCopy.email = false;
    }
    if (!empId) {
      emptyFieldsCopy.empId = true;
      hasEmptyFiled = true;
    } else {
      emptyFieldsCopy.empId = false;
    }
    if (!station) {
      emptyFieldsCopy.station = true;
      hasEmptyFiled = true;
    } else {
      emptyFieldsCopy.station = false;
    }
    if (!role) {
      emptyFieldsCopy.role = true;
      hasEmptyFiled = true;
    } else {
      emptyFieldsCopy.role = false;
    }
    if (!app) {
      emptyFieldsCopy.app = true;
      hasEmptyFiled = true;
    } else {
      emptyFieldsCopy.app = false;
    }
    if (!orgnisation) {
      emptyFieldsCopy.orgnisation = true;
      hasEmptyFiled = true;
    } else {
      emptyFieldsCopy.orgnisation = false;
    }
    setEmptyFields(emptyFieldsCopy);
    if (hasEmptyFiled) {
      return;
    }
    let userEmail = false;
    let userID = false;
    if (editingIndex === null) {
      if (checkDuplicateEmail(email)) {
        setEmailError("*Email already Exist");
        userEmail = true;
      } else {
        setEmailError("");
      }
      if (checkDuplicateUserID(empId)) {
        setUserIDError("*User Id already exist");
        userID = true;
      } else {
        setUserIDError("");
      }
    }
    if (userEmail || userID) {
      return;
    }
    // const formdata = {
    //       Action: editingIndex !== null ? "UpdateUser" : "InsertUser",
    //       UserId: email,
    //       EmployeeID: empId,
    //       Name: name,
    //       StationCode: station,
    //       AppPermission: app,
    //       RoleId: role,
    //       Organisation: orgnisation,
    //       IsActive: status,
    //       LoggedInUserId:Uid
    //     }
    setLoading(true);
    try {
      const response = await axios.post(
        `${Environment.BaseAPIURL}/InsertUserandUpdate`,
        {
          Action: editingIndex !== null ? "UpdateUser" : "InsertUser",
          UserId: email,
          EmployeeID: empId,
          Name: name,
          StationCode: station,
          AppPermission: app,
          RoleId: role,
          Organisation: orgnisation,
          IsActive: status,
          LoggedInId:Uid
        }
      );
      if (response.data.success) {
        const updateUserTable = await axios.post(
        `${Environment.BaseAPIURL}/GetUserUpdateData`,{Action: "GetReportUser"});
        const userDataupdated = Array.isArray(updateUserTable?.data) ? updateUserTable?.data : [];
        setTableData(userDataupdated);
        setFilterData(userDataupdated);
        setUserData1(userDataupdated);
        if (editingIndex === null) {
          setText("User added successfully");
          setShowPopUpModal(true);
          try {
            const insertData = await axios.post(`${Environment.BaseAPIURL}/InsertAuditReport`,{
               "IpAddress": IpAddress,
               "Action": "Add User",
               "ProcessName": "User Added Successfully",
               "UserId": email
            })
            // console.log("response insert in audit",insertData?.data?.response);
            // console.log("Obj",obj)
            } catch (error) {
              console.log("error in sending data",error);
            }
        } else {
          setText("User updated successfully");
          setShowPopUpModal(true);
          try {
            const insertData = await axios.post(`${Environment.BaseAPIURL}/InsertAuditReport`,{
               "IpAddress": IpAddress,
               "Action": "Update User",
               "ProcessName": "User Updated Successfully",
               "UserId": email
            })
            // console.log("response insert in audit",insertData?.data?.response);
            } catch (error) {
              console.log("error in sending data",error);
            }
        }
      } else {
        toast.error("Failed to add or update the user");
      }
    } catch (error) {
      console.log("error in adding updating the user", error);
    }
    setLoading(false);
    // console.log("user Add",formdata);
    handleReset();
  };

  // handle edit buttons
  const handleEdit = (index) => {
    const editedUser = tableData[index];
    console.log("edited data", editedUser);
    if (editedUser) {
      setName(editedUser.name);
      setEmail(editedUser.userId);
      setEmpId(editedUser.employeeID);
      setStation(editedUser.stationCode);
      setStatus(editedUser.isActive);
      setOrganisation(editedUser.organisation);
      setRole(editedUser.roleId);
      setApp(editedUser.appPermission);
      setEditingIndex(index);
      setEmptyFields({
        name: false,
        email: false,
        empId: false,
        station: false,
        role: false,
        app: false,
        orgnisation: false,
      });
    } else {
      console.log("Edited User does not found");
    }
    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const handleDelete = async (data, index) => {
    try {
      const response = await axios.post(
        `${Environment.BaseAPIURL}/InsertUserandUpdate`,
        {
          Action: "DeleteUser",
          UserId: data,
          EmployeeID: "",
          Name: "",
          StationCode: "",
          AppPermission: "",
          RoleId: 0,
          Organisation: "",
          IsActive: 0,
        }
      );
      if (response?.data?.success) {
        const updateUserTable = await axios.post(
          `${Environment.BaseAPIURL}/GetUserUpdateData`,
          {
            Action: "GetReportUser",
          }
        );
        const userDataupdated = Array.isArray(updateUserTable?.data)
          ? updateUserTable?.data
          : [];
        setTableData(userDataupdated);
        setFilterData(userDataupdated);
        setUserData1(userDataupdated);
      } else {
        setTableData([]);
        setFilterData([]);
        setUserData1([]);
      }
    } catch (error) {
      console.log("User cant deleted", error);
    }
  };

  const [excel, setExcel] = useState(false);
  const addexcel = () => {
    console.log("clickrd");
    setExcel(true);
    console.log(excel, "excel drop down");
  };

  const closeDropDown = () => {
    setExcel(false);
  };

  const handleDeleteFile = () => {
    setUploadedFile(null);
  };

  const handleDrop = (acceptedFiles) => {
    console.log(acceptedFiles);
    const file = acceptedFiles[0];
    setUploadedFile(file);
    setLoading(true);
    setExcelError("");

    if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const firstRow = jsonData[0] || {};
        const columnNames = Object.keys(firstRow);

        const allowedColumns = [
          "Sr. No.",
          "User Id",
          "Name",
          "Email ID",
          "Station",
          "Role",
          "Organization",
          "Application",
        ];
        const extraColumns = columnNames.filter(
          (col) => !allowedColumns.includes(col)
        );
        const missingColumns = allowedColumns.filter(
          (col) => !columnNames.includes(col)
        );
        if (extraColumns.length > 0 || missingColumns.length > 0) {
          if (extraColumns.length > 0) {
            toast.error(
              "Excel file contains extra columns: " + extraColumns.join(", ")
            );
          }
          if (missingColumns.length > 0) {
            toast.error(
              "Excel file is missing required columns: " +
                missingColumns.join(", ")
            );
          }

          setFileData(null);
          setUploadedFile(null);
          setLoading(false);
          return;
        }

        // Check for empty "User Id" or "Email ID"
        const hasEmptyRequiredFields = jsonData.some((row) => {
          return !row["User Id"] || !row["Email ID"];
        });

        if (hasEmptyRequiredFields) {
          toast.error(
            "Excel file contains empty 'User Id' or 'Email ID'. Please fix the file and try again."
          );
          setLoading(false);
          return;
        }

        // Filtered and validated data
        const filteredData = jsonData.map((row) => {
          const newRow = {};
          columnNames.forEach((columnName) => {
            newRow[columnName] = row[columnName];
          });
          return newRow;
        });

        setFileData(filteredData);
        setLoading(false);
      };

      reader.readAsBinaryString(file);
    } else {
      setLoading(false);
      setExcelError("Please select a valid Excel file (.xlsx or .xls).");
      toast.error("please select valid excel file ");
      setFileData(null);
      setUploadedFile(null);
    }
  };

  const validateExcelFile = () => {
    if (!fileData || fileData.length === 0) {
      toast.error("No data to validate.");
      return;
    }
    setMatchedData(fileData);
    setShowModal(true);
  };

  const deleteDuplicateRows = () => {
    const filteredData = excelData.filter(
      (row) =>
        !matchedData.some((dup) => JSON.stringify(dup) === JSON.stringify(row))
    );

    setExcelData(filteredData); // Remove duplicates from main data
    setMatchedData([]); // Clear matched (duplicate) data
    setDuplicatesDeleted(true); // Enable submit button
  };

  const handleSubmitExcelFile = () => {
    // Logic to submit the cleaned data
    console.log("submitting data", excelData);
    console.log("Submitting cleaned data...");
    setFileData(null);
    setUploadedFile(null);
    setExcel(false);
    setShowModal(false);
    toast.success("User Data uploaded successfully");
    // maybe send API call here
  };

  return (
    <>
      <Suspense fallback={<Spinner />}>
        {loading && <Spinner />}
        <div className="main-container-user">
          <Navbar />
          <div className="User-container">
            <div className="user-uper">
              <form className="user-form" onSubmit={handleSubmit}>
                <div className="user-form-upper-part">
                  <div className="boxes">
                    <span>
                      {/* <FaPhoneAlt /> */}
                      <FontAwesomeIcon icon={faUser} />
                    </span>
                    <input type="text" className={`user-input ${emptyFields.empId ? "error-border" : ""}`}
                      placeholder="Enter employee ID" value={empId} onChange={handleMobileChange} disabled={editingIndex !== null}/>
                    {emptyFields.empId && (
                      <div className="error-message">
                        *Employee ID is required
                      </div>
                    )}
                    {userIDError && (
                      <p className="error-message">{userIDError}</p>
                    )}
                  </div>
                  <div className="boxes">
                    <span>
                      {/* <FaUser /> */}
                      <FontAwesomeIcon icon={faUser} />
                    </span>
                    <input type="text" value={name} onChange={handleNameChange} placeholder="Enter Name" className={`user-input ${emptyFields.name ? "error-border" : "" }`}/>
                    {emptyFields.name && (
                      <div className="error-message">*Name is required</div>
                    )}
                  </div>
                  <div className="boxes">
                    <span>
                      {/* <MdMarkEmailUnread /> */}
                      <FontAwesomeIcon icon={faEnvelope} />
                    </span>
                    <input type="email"value={email} onChange={handleEmailChange} placeholder="Enter Email" className={`user-input ${emptyFields.email ? "error-border" : "" }`}
                      disabled={editingIndex !== null} />
                    {emptyFields.email && (
                      <div className="error-message">*Email is required</div>
                    )}
                    {emailError && (
                      <p className="error-message">{emailError}</p>
                    )}
                  </div>
                  <div className="boxes">
                    <span>
                      {/* <MdOutlineLocalAirport /> */}
                      <FontAwesomeIcon icon={faBuildingNgo} />
                    </span>
                    <select value={orgnisation} onChange={handleOrgnisationChange} className={`user-input ${emptyFields.role ? "error-border" : ""}`}>
                      <option value="" disabled> Select Organization </option>
                      {organisationData.map((data, index) => (
                        <option key={index} value={data.orgName}>
                          {data.orgName}
                        </option>
                      ))}
                    </select>
                    {emptyFields.orgnisation && (
                      <div className="error-message">
                        *Organization is required
                      </div>
                    )}
                  </div>
                  <div className="boxes">
                    <span>
                      {/* <MdOutlineLocalAirport /> */}
                      <FontAwesomeIcon icon={faUserTie} />
                    </span>
                    <select value={role} onChange={handleRoleChange} className={`user-input ${emptyFields.role ? "error-border" : ""}`}>
                      <option value="" disabled> Select Role</option>
                      {roleData.map((data, index) => (
                        <option key={index} value={data.roleId}>
                          {data.roleName}
                        </option>
                      ))}
                    </select>
                    {emptyFields.role && (<div className="error-message"> *Role is required</div>)}
                  </div>
                  <div className="boxes">
                    <span>
                      {/* <MdOutlineLocalAirport /> */}
                      <FontAwesomeIcon icon={faPlaneUp} />
                    </span>
                    <select value={station} onChange={handleStationChange} className={`user-input ${ emptyFields.station ? "error-border" : ""}`}>
                      <option value="" disabled> Select Station </option>
                      {stationData.map((station, index) => (
                        <option key={index} value={station.destination}>
                          {station.destination}
                        </option>
                      ))}
                    </select>
                    {emptyFields.station && (<div className="error-message"> *Station is required</div>)}
                  </div>
                  <div className="boxes">
                    <span><FontAwesomeIcon icon={faDesktop} /></span>
                    <select value={app} onChange={handleApplicationChange} className={`user-input ${ emptyFields.app ? "error-border" : ""}`}>
                      <option value="" disabled> Select Application </option>
                      {permissionData.map((org, index) => (
                        <option key={index} value={org.loginDevicePortal}>
                          {org.loginDevicePortal}
                        </option>
                      ))}
                    </select>
                    {emptyFields.app && (<div className="error-message"> *Application is required</div> )}
                  </div>
                  <div
                    className="boxes"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", }}>
                    <div className="add-bulk" onClick={addexcel}>
                      Upload{" "} <div style={{ height: "25px", width: "30px" }}>
                        <img src="images/excel.png" alt="" style={{ height: "100%", width: "100%" }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="user-form-lower-part">
                  {/* // Switch toggle button */}
                  {editingIndex !== null && (
                    <Switch checked={status === 1} onChange={() => setStatus(status === 1 ? 0 : 1)}/> )}
                  {editingIndex !== null ? (
                    <>
                      <button type="button" onClick={handleReset} className="user-reset" > Reset </button>
                      <button type="submit" className="user-add"> Update </button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={handleReset} className="user-reset" > Reset </button>
                      <button type="submit" className="user-add"> Add </button>
                    </>
                  )}
                </div>
              </form>
              <div className="doprzone-container-main">
                {excel && (
                  <a href={`${process.env.PUBLIC_URL}/excelTemplate.xlsx`} download="excelTemplate.xlsx" className="top-right-button" >
                    Download Excel Template </a>)}
                {excel && (
                  <Dropzone onDrop={handleDrop} accept=".xlsx">
                    {({ getRootProps, getInputProps, isDragActive }) => (
                      <section className="dropzone-container">
                        <div
                          {...getRootProps()} 
                          className={`dropzone-area ${isDragActive ? "active" : ""}`}>
                          <input {...getInputProps()} />
                          {isDragActive ? (
                            <p className="dropzone-text-active"> Drop the files here...</p>
                          ) : (
                            <>
                              <p className="dropzone-icon">📁 Drag & drop files here </p>
                              <p className="dropzone-text">or click to select files</p>
                            </>
                          )}
                          {uploadedFile && (<div className="uploaded-file-name">📄 <strong>{uploadedFile.name}</strong></div>)}
                        </div>
                        <div className="validation-excel-buttons">
                          <div className="closeDropDown" onClick={closeDropDown}> Close </div>
                          {uploadedFile && (
                            <div className="file-buttons">
                              <button className="validate-button" onClick={validateExcelFile}>
                                Validate File
                              </button>
                              <button className="delete-button" onClick={handleDeleteFile}>
                                Delete File
                              </button>
                            </div>
                          )}
                        </div>
                      </section>
                    )}
                  </Dropzone>
                )}
              </div>
              <div className="user-container-part-2">
                <div className="user-search-button">
                  <span className="search-icon">
                    {/* <IoSearchSharp /> */}
                    <FontAwesomeIcon icon={faMagnifyingGlass} style={{fontSize:"1.5rem"}}/>
                  </span>
                  <input type="text" placeholder="Search" onChange={handleSearch} className="user-search-input"/>
                </div>
              </div>
            </div>
            <div className="table-scroll-vertical" style={{ marginTop: "1rem" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Sr. no</th>
                    <th>User Id</th>
                    <th>Name</th>
                    <th>Email ID</th>
                    <th>Station</th>
                    <th>Role</th>
                    <th>Organization</th>
                    <th>App permission</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((data, index) => (
                    <tr>
                      <td>{index + 1}</td>
                      <td>{data.employeeID}</td>
                      <td>{data.name}</td>
                      <td>{data.userId}</td>
                      <td>{data.stationCode}</td>
                      <td>{data.roleName}</td>
                      <td>{data.organisation}</td>
                      <td>{data.appPermission}</td>
                      <td>
                        {String(data.isActive) === "1" ? "Active" : "Inactive"}
                      </td>
                      <td>
                        <FontAwesomeIcon icon={faPenToSquare} style={{ cursor: "pointer", marginRight: "10px",fontSize: "1.1rem" }} onClick={() => handleEdit(index)}/>
                        {/* <FaEdit  /> */}
                        {/* <MdDeleteForever style={{ cursor: "pointer", fontSize: "1.1rem" }}
                          onClick={() => {setSelectedUserId(data.userId); setSelectedUserIndex(index); setShowDeleteModal(true)}}/> */}
                          <FontAwesomeIcon icon={faTrash} style={{ cursor: "pointer", fontSize: "1.1rem" }}
                          onClick={() => {setSelectedUserId(data.userId); setSelectedUserIndex(index); setShowDeleteModal(true)}}/>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Footer />
          {showDeleteModal && (
            <div className="delete-Modal-overLay">
            <div className="delete-modal-content">
            <div className="warning-image"><img src="/images/warning.png" alt="" style={{height:"100%",width:"100%"}}/></div>
            <div className="text-para">Are you sure you want to delete the user</div>
            <div className="delete-modal-buttons">
              <button className="yes-button" onClick={() => { handleDelete(selectedUserId, selectedUserIndex); setShowDeleteModal(false);
                      setText("User deleted successfully"); setShowPopUpModal(true); }}>Yes</button>
              <button className="no-button" onClick={() => setShowDeleteModal(false)}>No</button>
            </div>
          </div>
          </div>)}
          {showModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                {matchedData.length > 0 ? (
                  <>
                    <h3>Duplicate Entries Found</h3>
                    <table className="duplicate-table">
                      <thead>
                        <tr>
                          {Object.keys(matchedData[0]).map((col, idx) => (
                            <th key={idx}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {matchedData.map((row, i) => (
                          <tr key={i}>
                            {Object.values(row).map((val, j) => (
                              <td key={j}>{val}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button
                      onClick={deleteDuplicateRows}
                      className="duplicate-excel-button"
                    >
                      Delete duplicate values
                    </button>
                    {duplicatesDeleted && (
                      <button
                        onClick={handleSubmitExcelFile}
                        className="submit-excel-data"
                      >
                        Submit Data
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <h3>No duplicate values found</h3>
                    <button
                      onClick={handleSubmitExcelFile}
                      className="submit-excel-data"
                    >
                      Submit Data
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        {showPopUpModal && <PopUpModal text={text} onClose={()=>setShowPopUpModal(false)}/>}
      </Suspense>
    </>
  );
};

export default AddUser;