import React, { useEffect, useState, lazy, Suspense, useRef } from "react";
import "../component/Footer.css"
import "../component/Navbar.css"
import "./AddRole.css"; // Import CSS here
import Switch from "react-switch";
import axios from "axios";
import Environment from "../Environment";
import Spinner from "../component/Spinner";
import PopUpModal from "../component/PopUpModal";
import secureLocalStorage from "react-secure-storage";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faUserTie,faMagnifyingGlass,faPenToSquare} from '@fortawesome/free-solid-svg-icons';
const Navbar = lazy(() => import('../component/Navbar'))
const Footer = lazy(() => import('../component/Footer'))
const AddRole = () => {
  const userId = secureLocalStorage.getItem("userId");
  const IpAddress = secureLocalStorage.getItem("IP")
  const rolePermissions = {
    DashBoard: ["Dashboard"],
    Administration: ["Add Role", "Add User","Add Organisation","Add Device & Printer"],
    Reports: ["Load Sheet Details","AuditReport","Load Sheet Image Report"],
    Assign_Permission_For_App: ["View & Print","Print"]
  };

  const cleaned = Object.fromEntries(
  Object.entries(rolePermissions).map(([key, value]) => [
    key.replace(/_/g, " "), // remove all underscores
    value
  ])
);

console.log(cleaned);
  const [loading,setLoading] = useState(false);
  const [accordionStates, setAccordionStates] = useState({});
  const [selectedRolePermissions, setSelectedRolePermissions] = useState([]);
  const [permissionError, setPermissionError] = useState("");
  const [reportDropDown,setReportDropDown] = useState([]);
  const [roleName, setRoleName] = useState("");
  const [reportsTo,setReportTo] = useState("");
  const [searchTerm,setSearchTerm] = useState("");
  const [tableData,setTableData] = useState([]);
  const [filterData,setFilterData] = useState([]);
  const [roleError,setRoleError] = useState("");
  // const roleError = useRef();
  const [roleData1,setRoleData1] = useState([]);
  const [status,setStatus] = useState(1)
  const [editingIndex,setEditingIndex] = useState(null)
  const [emptyFields,setEmptyFields] = useState({
    roleName:false,
    reportsTo:false
  });
  const [rolePermissionList,setRolePermissionList] = useState([]);
  const [showPopUpModal,setShowPopUpModal] = useState(false);
  const [text,setText] = useState("");
  const Uid = secureLocalStorage.getItem("UID")
  const handleAccordionPermissionToggle = (permission) => {
  setSelectedRolePermissions((prev) => {
    const index = prev.findIndex(p => p.PageUrl === permission);
    if (index !== -1) {
      // Toggle off
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    } else {
      // Toggle on
      return [...prev, { PageUrl: permission, IsActive: 1 }];
    }
  });
  setPermissionError("");
};


  const roleChange = (e) => {
    setRoleName(e.target.value);
    setRoleError('')
    // roleError.current = '';
    if(e.target.value !== ''){
      setEmptyFields(prev => ({...prev,roleName:false}));
    }
    if(e.target.value !=='' && checkDuplicateRole(e.target.value)){
      setRoleError("*Role already exists")
      // roleError.current = "*Role already exists";
    }
  }

  const reportToChange = (e) => {
    setReportTo(e.target.value);
    if(e.target.value !== ''){
      setEmptyFields(prev => ({...prev,reportsTo:false}));
    }
  }

  const removeAllSpaces = (str) => {
  return str.replace(/\s+/g, '');
  };

   // to check the duplicate role
  const checkDuplicateRole = (role) => {
    const roleName = removeAllSpaces(role);
    return roleData1.some( user => String(removeAllSpaces(user.roleName)).toLowerCase() === roleName.toLowerCase())
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

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch RoleName dropdown data
      const roleNameResponse = await axios.post(`${Environment.BaseAPIURL}/GetRolenameAndData`, {
        "Action": "RoleName"
      });
      const roleNameData = Array.isArray(roleNameResponse?.data) ? roleNameResponse.data : [];
      setReportDropDown(roleNameData);

      // Fetch RoleData table data
      const roleDataResponse = await axios.post(`${Environment.BaseAPIURL}/GetRolenameAndData`, {
        "Action": "RoleData"
      });
      const roleData = Array.isArray(roleDataResponse?.data) ? roleDataResponse.data : [];
      setTableData(roleData);
      setFilterData(roleData);
      setRoleData1(roleData);

    } catch (error) {
      console.log("Error fetching role name or data", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);


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
      // roleError.current = "*Role already exist";
      role = true;
    }
    else {
      setRoleError("");
      // roleError.current = '';
    }
  }
  if(role){
    return;
  }


  const allPermissions = [];

  // Loop over all parent and child permissions
  // Object.entries(rolePermissions).forEach(([parent, children]) => {
  Object.entries(cleaned).forEach(([parent, children]) => {
    children.forEach(child => {
      const selectedChild = selectedRolePermissions.find(sel =>
        sel.PageUrl === child
      );

      allPermissions.push({
        PageUrl: child,
        IsActive: selectedChild?.IsActive == undefined || 0 ? 0 : 1
      });

      console.log(allPermissions, selectedChild, children, rolePermissions)
    });
  });


 const formData = {
  roleName: roleName,
  reportsToRoleName: reportsTo,
  permissions: allPermissions,
  status: status,
  action: editingIndex !== null ? "UpdateRole" : "AddRole",
  loggedInId:Uid
};
  setLoading(true);
  try {
    const response = await axios.post(`${Environment.BaseAPIURL}/InsertallPagepermission`,formData);
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
      const roleId = response?.data?.roleId;
      if(editingIndex!==null){
        setText("Role updated successfully");
        setShowPopUpModal(true);
        try {
          const insertData = await axios.post(`${Environment.BaseAPIURL}/InsertAuditReport`,{
             "IpAddress": IpAddress,
             "Action": "Update Role",
             "ProcessName": "Role Updated Successfully",
             "UserId": roleId,
             "CreatedBy":Uid,
             "TemplateId": "UpdateRole"
          })
          console.log("response insert in audit",insertData?.data?.response);
          // console.log("Obj",obj)
        } catch (error) {
          console.log("error in sending data",error);
        }
      }else{
        setText("Role added successfully")
        setShowPopUpModal(true);
        try {
          const insertData = await axios.post(`${Environment.BaseAPIURL}/InsertAuditReport`,{
             "IpAddress": IpAddress,
             "Action": "Add Role",
             "ProcessName": "Role Added Successfully",
             "UserId": roleId,
             "CreatedBy":Uid,
             "TemplateId": "AddRole"
          })
          console.log("response insert in audit",insertData?.data?.response);
          // console.log("Obj",obj)
        } catch (error) {
          console.log("error in sending data",error);
        }
      }
    }
    setLoading(false);
  } catch (error) {
    console.log("error in adding the role permission");
    setLoading(false);
  }
  console.log("Form submitted:", formData);
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
  setRoleError('');
  // roleError.current = '';
}

const handleEdit = (index) => {
  const editData = tableData[index];
  if (!editData) {
    console.log("Edited role not found");
    return;
  }

  setRoleName(editData.roleName);
  setStatus(editData.isActive);
  setReportTo(editData.reportsToRoleName);
  setEditingIndex(index);
  setEmptyFields({
    roleName: false,
    reportsTo: false
  });
  setPermissionError("");
  console.log("permission list",editData.permissionList);
  // Extract selected permissions
  const extractedPermissions = editData.permissionList.map(p => ({
    PageUrl: p.pageUrl,
    IsActive: p.isActive
  }));
  setSelectedRolePermissions(extractedPermissions);
  setRolePermissionList(editData.permissionList);

  // Auto-open accordions that include selected permissions
  const selectedUrls = extractedPermissions.map(p => p.PageUrl.toLowerCase()); // normalize casing
  const newAccordionStates = {};

  // Object.entries(rolePermissions).forEach(([section, children], idx) => {
  Object.entries(cleaned).forEach(([section, children], idx) => {
    const hasSelected = children.some(permission => 
      selectedUrls.includes(permission.toLowerCase())
    );
    if (hasSelected) {
      newAccordionStates[idx] = true;
    }
  });

  setAccordionStates(newAccordionStates);

  // Scroll to top
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};


  return (
    <Suspense fallback={<Spinner/>}>
      {loading && <Spinner />}
    <div>
      <Navbar />
      <div className="role-container">
        <form className="role-top-container" onSubmit={handleSubmit} >
          {/* Left Side */}
          <div className="role-top-left-container">
            <div className="role-upper">
              <div className="role-input">
                <span><FontAwesomeIcon icon={faUserTie} /></span>
                <input placeholder="Enter role name "  value={roleName} onChange={roleChange}
                className={`role-text-input ${emptyFields.roleName ? 'error-border' : ''}`} 
                disabled = {editingIndex !== null}/>
                {emptyFields.roleName && <div className="error-message">*Role is required</div>}
                {roleError && <p className="error-message">{roleError}</p>}
              </div>
              <div className="role-select">
                <span><FontAwesomeIcon icon={faUserTie} /></span>
                <select  value={reportsTo} onChange={reportToChange}
                className={`role-text-select ${emptyFields.reportsTo ? 'error-border' : ''}`}>
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
            <div className="assing-permission">Assign permissions</div>
            <div className="accordion">
              {/* {Object.keys(rolePermissions).map((roleKey, index) => ( */}
              {Object.keys(cleaned).map((roleKey, index) => (
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
                      {/* {rolePermissions[roleKey].map((permission, idx) => ( */}
                      {cleaned[roleKey].map((permission, idx) => (
                        <div
                          key={idx}
                          onClick={() =>
                            handleAccordionPermissionToggle(permission)
                          }
                          className={`permission-item ${
                            // selectedRolePermissions.includes(permission)
                            selectedRolePermissions.some(p => p.PageUrl === permission)
                              ? "selected"
                              : ""
                          }`}
                        >
                          {selectedRolePermissions.some(p => p.PageUrl === permission)
                          // {selectedRolePermissions.includes(permission)
                           ? (
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

             {/* <div className="assing-permission">Assign permissions for App</div> */}
            {permissionError && (
              <div className="error-message">{permissionError}</div>
            )}
          </div>
        </form>

        {/* Optional future sections */}
        <div className="role-middle-container">
             <div className="user-search-button">
                          <span className="search-icon">
                            {/* <IoSearchSharp /> */}
                            <FontAwesomeIcon icon={faMagnifyingGlass} style={{fontSize:"1.4rem"}}/>
                          </span>
                          <input type="text" placeholder="Search" onChange={handleSearch} className="user-search-input" />
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
                        <FontAwesomeIcon icon={faPenToSquare} style={{fontSize:"1.1rem"}}/>
                        </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>

      <Footer />
    </div>
    {/* <ToastContainer /> */}
    {showPopUpModal && <PopUpModal text={text} onClose={()=>setShowPopUpModal(false)}/>}
  </Suspense>
  );
};

export default AddRole;
