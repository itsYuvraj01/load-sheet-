import React, { useEffect, useState, lazy, Suspense } from "react";
import "../component/Footer.css"
import "../component/Navbar.css"
// import Navbar from "../component/Navbar";
// import Footer from "../component/Footer";
import "./AddRole.css"; // Import CSS here
import Switch from "react-switch";
import { IoSearchSharp } from "react-icons/io5";
// import roleData from "../Data/RoleData";
import { FaEdit } from "react-icons/fa";
import axios from "axios";
import Environment from "../Environment";
import Spinner from "../component/Spinner";
import { toast } from "react-toastify";

// import Navbar from "../component/Navbar";
const Navbar = lazy(() => import('../component/Navbar'))
// import Footer from "../component/Footer";
const Footer = lazy(() => import('../component/Footer'))

const AddRole = () => {
  const rolePermissions = {
    Dashboard: ["Dashboard"],
    Administration: ["Add Role", "Add User"],
    Reports: ["Load Sheet Details"],
  };
  const [loading,setLoading] = useState(false);
  const [accordionStates, setAccordionStates] = useState({});
  const [selectedRolePermissions, setSelectedRolePermissions] = useState([]);
  const [permissionError, setPermissionError] = useState("");
  const [reportDropDown,setReportDropDown] = useState([]);
  const [roleName, setRoleName] = useState("");
  const [reportsTo,setReportTo] = useState("");
  const [searchTerm,setSearchTerm] = useState("");
  const [tableData,setTableData] = useState([]);
//   const [tableData,setTableData] = useState(roleData);
  const [filterData,setFilterData] = useState([]);
//   const [filterData,setFilterData] = useState(roleData);
  const [roleError,setRoleError] = useState("");
  const [roleData1,setRoleData1] = useState([]);
//   const [roleData1,setRoleData1] = useState(roleData);
  //const [roleError,setRoleError] = useState("");
  const [status,setStatus] = useState(1)
  const [editingIndex,setEditingIndex] = useState(null)
  const [emptyFields,setEmptyFields] = useState({
    roleName:false,
    reportsTo:false
  });
  const [rolePermissionList,setRolePermissionList] = useState([]);

  const handleAccordionPermissionToggle = (permission) => {
    setSelectedRolePermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
    setPermissionError("");
  };

  const roleChange = (e) => {
    setRoleName(e.target.value);
    setRoleError('')
    if(e.target.value !== ''){
      setEmptyFields(prev => ({...prev,roleName:false}));
    }
    if(e.target.value !=='' && checkDuplicateRole(e.target.value)){
      setRoleError("*Role already exists")
    }
  }

  const reportToChange = (e) => {
    setReportTo(e.target.value);
    if(e.target.value !== ''){
      setEmptyFields(prev => ({...prev,reportsTo:false}));
    }
  }

   // to check the duplicate email
  const checkDuplicateRole = (role) => {
    return roleData1.some( user => String(user.roleName).toLowerCase() === role.toLowerCase())
  };

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
      )
    );
    setTableData(filtered);
  };

//   drop down data api
  useEffect(()=>{
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${Environment.BaseAPIURL}/GetRolenameAndData`,{
                "Action": "RoleName"
            });
            // console.log("role drop down response",response?.data);
            const da = Array.isArray(response?.data) ? response?.data : [];
            setReportDropDown(da);
        } catch (error) {
            console.log("error in fetching report",error);
        }
    }
    fetchData();
  },[])

//   table data api
  useEffect(()=>{
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${Environment.BaseAPIURL}/GetRolenameAndData`,{
                "Action": "RoleData"
            });
            console.log("role drop down response",response?.data);
            const data = Array.isArray(response?.data) ? response?.data : []
            setTableData(data);
            setFilterData(data);
            setRoleData1(data);
            // toast.success("data found")
        } catch (error) {
            console.log("error in fetching report",error);
        }
    }
    fetchData();
  },[])

  const handleSubmit = async(e) => {
  e.preventDefault();
  const emptyFieldsCopy = {...emptyFields}
  let hasEmptyFiled = false;
  if(!roleName){
    emptyFieldsCopy.roleName = true;
    hasEmptyFiled = true
  }
  else{
    hasEmptyFiled = false
  }
  if(!reportsTo){
    emptyFieldsCopy.reportsTo = true;
    hasEmptyFiled = true;
  }
  else{
    hasEmptyFiled = false;
  }
  const noPermissionsSelected = selectedRolePermissions.length === 0;
  setEmptyFields(emptyFieldsCopy);
  setPermissionError(noPermissionsSelected ? "*Please select at least one permission." : "");
  if(hasEmptyFiled || noPermissionsSelected){
    return;
  }
  let role = false;
  if(editingIndex === null) {
    if(checkDuplicateRole(roleName)){
      setRoleError("*Role already exist");
      role = true;
    }
    else {
      setRoleError("");
    }
  }
  if(role){
    return;
  }
  const formData = { 
    roleName,
    reportsTo,
    permissions: selectedRolePermissions,
  };
  setLoading(true);
  try {
    const response = await axios.post(`${Environment.BaseAPIURL}/InsertallPagepermission`,{
      "Action": editingIndex !== null ? "UpdateRole" : "AddRole",
      "RoleName": roleName,
      "ReportsToRoleName": reportsTo,
      "Permissions": selectedRolePermissions,
      "Status": status
    }
    );
    console.log("response after add",response?.data?.success);
    if(response?.data?.success){
      const tblData = await axios.post(`${Environment.BaseAPIURL}/GetRolenameAndData`,{
         "Action": "RoleData"
      });
      const roleDropDown = await axios.post(`${Environment.BaseAPIURL}/GetRolenameAndData`,{
        "Action": "RoleName"
      })
      const da = Array.isArray(roleDropDown?.data) ? roleDropDown?.data : []
      setReportDropDown(da);
      const data = Array.isArray(tblData?.data) ? tblData?.data : []
      setTableData(data);
      setFilterData(data);
      setRoleData1(data);
      if(editingIndex!==null){
        toast.success("Role Updated Successfully",{
          autoClose:1500
        })
      }else{
        toast.success("Role Added Successfully",{
          autoClose:1500
        })
      }
    }
    setLoading(false);
  } catch (error) {
    console.log("error in adding the role permission");
    setLoading(false);
  }
  console.log("Form submitted:", formData);

  // Reset form (optional)
//   setRoleName('');
//   setReportTo('');
//   setSelectedRolePermissions([]);
//   setAccordionStates({});
   handleReset()
};

const handleReset = () => {
  setRoleName('');
  setReportTo('');
  setSelectedRolePermissions([]);
  setAccordionStates({});
  setEmptyFields({
    roleName:false,
    reportsTo:false
  })
  setPermissionError("")
  setEditingIndex(null);
}

const handleEdit = (index) => {
  const editData = tableData[index];
  if (editData) {
    setRoleName(editData.roleName);
    setReportTo(editData.reportsToRoleName);
    setEditingIndex(index);
    setEmptyFields({
      roleName: false,
      reportsTo: false
    });
    setPermissionError("");

    // Extract permission names
    const extractedPermissions = editData.permissionList.map(p => p.pageUrl);
    setSelectedRolePermissions(extractedPermissions);
    setRolePermissionList(editData.permissionList);

    // Automatically open accordions containing the permissions
    const newAccordionStates = {};
    Object.keys(rolePermissions).forEach((section, idx) => {
      const sectionPermissions = rolePermissions[section];
      const hasSelected = sectionPermissions.some(p => extractedPermissions.includes(p));
      if (hasSelected) newAccordionStates[idx] = true;
    });
    setAccordionStates(newAccordionStates);
  } else {
    console.log("Edited user not found");
  }

  // Scroll to top
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

  return (
    <Suspense fallback={<Spinner/>}>
    <div>
      <Navbar />
      <div className="role-container">
        <form className="role-top-container" onSubmit={handleSubmit}>
          {/* Left Side */}
          <div className="role-top-left-container">
            <div className="role-upper">
              <div className="role-input">
                <input placeholder="Enter role name " 
                value={roleName}
                onChange={roleChange}
                className={`role-text-input ${emptyFields.roleName ? 'error-border' : ''}`} 
                disabled = {editingIndex !== null}/>
                {emptyFields.roleName && <div className="error-message">*Role is required</div>}
                {roleError && <p className="error-message">{roleError}</p>}
              </div>
              <div className="role-select">
                <select 
                value={reportsTo}
                onChange={reportToChange}
                // className="role-text-input"
                className={`role-text-select ${emptyFields.reportsTo ? 'error-border' : ''}`}
                >
                  <option value="" disabled>
                    Select Reporting Manager
                  </option>
                 {reportDropDown.map((data,index) => (
                    <option key={index} value={data.roleName}>{data.roleName}</option>
                 ))}
                </select>
                 {emptyFields.reportsTo && <div className="error-message">*Reporting manager is required</div>}
              </div>
            </div>
            <div className="role-down">
               {/* // Switch toggle button */}
                       {editingIndex !== null &&  <Switch
                checked={status === 1}
                onChange={() =>
                  setStatus(status === 1 ? 0 : 1)
                }
              />}
                      {/* )} */}
                      {editingIndex !== null ? (
                        <>
                          <button type="button" onClick={handleReset} className="user-reset">Reset</button>
                          <button type="submit" className="user-add">Update</button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={handleReset} className="user-reset">Reset</button>
                          <button type="submit" className="user-add">Add</button>
                        </>
                      )}
            </div>
          </div>
          {/* Right Side - Accordion */}
          <div className="role-top-right-container">
            <div className="assing-permission">Assign Permissions</div>
            <div className="accordion">
              {Object.keys(rolePermissions).map((roleKey, index) => (
                <div className="accordion-item" key={index}>
                  <div className="accordion-header">
                    <button
                      className={`accordion-button ${
                        accordionStates[index] ? "open" : ""
                      }`}
                      type="button"
                      onClick={() =>
                        setAccordionStates((prev) => ({
                          ...prev,
                          [index]: !prev[index],
                        }))
                      }
                    >
                      {roleKey.toUpperCase()}
                      <span className="accordion-icon">
                        {accordionStates[index] ? "▲" : "▼"}
                      </span>
                    </button>
                  </div>
                  {accordionStates[index] && (
                    <div className="accordion-body">
                      {rolePermissions[roleKey].map((permission, idx) => (
                        <div
                          key={idx}
                          onClick={() =>
                            handleAccordionPermissionToggle(permission)
                          }
                          className={`permission-item ${
                            selectedRolePermissions.includes(permission)
                              ? "selected"
                              : ""
                          }`}
                        >
                          {selectedRolePermissions.includes(permission) ? (
                            <strong>{permission}</strong>
                          ) : (
                            permission
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {permissionError && (
              <div className="error-message">{permissionError}</div>
            )}
          </div>
        </form>

        {/* Optional future sections */}
        <div className="role-middle-container">
             <div className="user-search-button">
                          <span className="search-icon">
                            <IoSearchSharp />
                          </span>
                          <input
                            type="text"
                            placeholder="Search"
                            onChange={handleSearch}
                            className="user-search-input"
                          />
                        </div>
        </div>
        <div className="table-scroll-vertical" style={{marginTop:"1rem"}}>
            <table>
              <thead>
                <tr>
                  <th>Sr. no</th>
                  <th>Role</th>
                  <th>Reports to</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((data,index)=>(
                    <tr key={index}>
                        <td>{index+1}</td>
                        <td>{data.roleName}</td>
                        <td>{data.reportsToRoleName}</td>
                        <td>{String(data.isActive) === "1" ? "Active" : "Inactive"}</td>
                        <td style={{ cursor: "pointer" }} 
                        onClick={() => handleEdit(index)}
                        >
                        <FaEdit />
                        </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>

      <Footer />
    </div>
  </Suspense>
  );
};

export default AddRole;
