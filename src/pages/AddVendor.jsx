import React, { lazy, useEffect, useState, useRef } from "react";
// import { IoSearchSharp } from "react-icons/io5";
// import {MdDeleteForever,} from "react-icons/md";
// import { FaEdit } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Switch from "react-switch";
import Environment from "../Environment";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSitemap,
  faBuildingNgo,
  faMapLocationDot,
  faLocationDot,
  faMobileRetro,
  faAt,
  faUserTie,
  faPenToSquare,
  faTrash,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import secureLocalStorage from "react-secure-storage";
import PopUpModal from "../component/PopUpModal";
const Navbar = lazy(() => import("../component/Navbar"));
const Footer = lazy(() => import("../component/Footer"));
const AddVendor = () => {
  const Uid = secureLocalStorage.getItem("UID");
  const [tableData, setTableData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [tableDataForDuplicacy, setTableDataForDuplicacy] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [organisationName, setOrganisationName] = useState("");
  const [organisationType, setOrganisationType] = useState("");
  const [location, setLocation] = useState("");
  const [state, setState] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [emailID, setEmailID] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(1);
  const [stateCapture, setStateCapture] = useState([]);
  const [duplicateEmailError, setDuplicateEmailError] = useState("");
  const [duplicateOrganisation, setDuplicateOrganisation] = useState("");
  const [duplicateLocation, setDuplicateLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const orgId = useRef(null);
  const [text, setText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal,setShowDeleteModal] = useState(false);
  const [deleteId,setDeleteId] = useState('');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const OrganisationTableData = await axios.post(
          `${Environment.BaseAPIURL}/GetOrgReportData`,
          { action: "GetOrgReport" }
        );
        const stateData = await axios.post(
          `${Environment.BaseAPIURL}/GetStatedrop`,
          { action: "GetStateDrop" }
        );
        console.log("orgreport", OrganisationTableData?.data);
        const orgResponse = Array.isArray(OrganisationTableData?.data)
          ? OrganisationTableData?.data
          : [];
        setTableData(orgResponse);
        setFilterData(orgResponse);
        setTableDataForDuplicacy(orgResponse);
        // state drop down
        const stateArray = Array.isArray(stateData?.data)
          ? stateData?.data
          : [];
        setStateCapture(stateArray);
        console.log("state", stateArray);
      } catch (error) {
        console.log("error in fetching data", error);
      }
    };
    fetchAllData();
  }, []);

  const handleEdit = (index) => {
    const editData = tableData[index];
    // console.log("edited dta",editData)
    const selectedStateName = editData.state;
    const selectedState = stateCapture.find(
      (s) => s.state === selectedStateName
    );
    const stateId = selectedState ? selectedState.id : null;
    // console.log(stateId,"123");
    if (editData) {
      orgId.current = editData.orgId;
      // setOrgId(editData.orgId);
      setOrganisationName(editData.orgName);
      setOrganisationType(editData.orgType);
      setLocation(editData.location);
      setState(stateId);
      setContactNo(editData.contactNo);
      setEmailID(editData.emailId);
      setContactPersonName(editData.contactPersonName);
      setStatus(editData.isActive);
      setEditingIndex(index);
      setErrors({});
    } else {
      console.log("Edited Organisation does not found");
    }
    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const handleReset = () => {
    // setOrgId(null);
    orgId.current = null;
    setOrganisationName("");
    setOrganisationType("");
    setState("");
    setLocation("");
    setContactNo("");
    setEmailID("");
    setContactPersonName("");
    setEditingIndex(null);
    setErrors({});
  };

  const removeAllSpaces = (str) => {
    return str.replace(/\s+/g, "");
  };

  const checkDuplicateEmail = (email) => {
    const cleanEmail = removeAllSpaces(email);
    return tableDataForDuplicacy.some(
      (data) => String(data.emailId).toLowerCase() === cleanEmail.toLowerCase()
    );
  };

  const checkDuplicateOrganisation = (organisation) => {
    const cleanOrganisation = removeAllSpaces(organisation);
    return tableDataForDuplicacy.some(
      (data) =>
        removeAllSpaces(String(data.orgName)).toLowerCase() ===
        cleanOrganisation.toLowerCase()
    );
  };

  const checkDuplicateLocation = (location) => {
    const cleanLocation = removeAllSpaces(location);
    return tableDataForDuplicacy.some(
      (data) =>
        removeAllSpaces(String(data.location)).toLowerCase() ===
        cleanLocation.toLowerCase()
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!organisationName.trim())
      newErrors.organisationName = "*Organisation Name is required";
    if (!organisationType.trim())
      newErrors.organisationType = "*Organisation Type is required";
    if (!state || isNaN(state)) newErrors.state = "*State is required";
    if (!location.trim()) newErrors.location = "*Location is required";
    if (!contactNo.trim()) newErrors.contactNo = "*Contact Number is required";
    else if (!/^\d+$/.test(contactNo))
      newErrors.contactNo = "*Only numbers allowed";
    if (!emailID.trim()) newErrors.emailID = "*Email ID is required";
    if (!contactPersonName.trim())
      newErrors.contactPersonName = "*Contact Person Name is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    let userEmail = false;
    let org = false;
    let loc = false;
    if (editingIndex === null) {
      if (checkDuplicateEmail(emailID)) {
        setDuplicateEmailError("*Email ID already Exist");
        userEmail = true;
      } else {
        setDuplicateEmailError("");
      }
      if (checkDuplicateOrganisation(organisationName)) {
        setDuplicateOrganisation("*Organisation already exist");
        org = true;
      } else {
        setDuplicateOrganisation("");
      }
      if (checkDuplicateLocation(location)) {
        setDuplicateEmailError("*Location already exist");
        loc = true;
      } else {
        setDuplicateEmailError("");
      }
    }
    if (userEmail || org) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${Environment.BaseAPIURL}/OrgAddandUpdate`,
        {
          action: editingIndex !== null ? "OrgUpdate" : "OrgAdd",
          orgId: editingIndex !== null ? orgId.current : null,
          orgName: organisationName,
          orgType: organisationType,
          location: location,
          stateId: parseInt(state),
          contactNo: contactNo,
          emailId: emailID,
          contactPersonName: contactPersonName,
          loggedInId: Uid,
          isActive: status,
        }
      );
      if (response.data.message === "Successfully Inserted") {
        setShowModal(true);
        setText("Organisation added successfully");
        const tableResponse = await axios.post(
          `${Environment.BaseAPIURL}/GetOrgReportData`,
          { action: "GetOrgReport" }
        );
        const orgResponse = Array.isArray(tableResponse?.data)
          ? tableResponse?.data
          : [];
        setTableData(orgResponse);
        setFilterData(orgResponse);
        setTableDataForDuplicacy(orgResponse);
        setLoading(false);
      } else if (response.data.message === "Updated Successfully") {
        setShowModal(true);
        setText("Organisation updated successfully");
        const tableResponse = await axios.post(
          `${Environment.BaseAPIURL}/GetOrgReportData`,
          { action: "GetOrgReport" }
        );
        const orgResponse = Array.isArray(tableResponse?.data)
          ? tableResponse?.data
          : [];
        setTableData(orgResponse);
        setFilterData(orgResponse);
        setTableDataForDuplicacy(orgResponse);
        setLoading(false);
      } else {
        console.log("failed to add/update organisation");
        setLoading(false);
      }
    } catch (error) {
      console.log("error in adding updating organisation", error);
      setLoading(false);
    }
    handleReset();
  };

  // Live input handlers with error-clearing
  const handleInputChange = (setter, fieldName) => (e) => {
    const value = e.target.value;
    setter(value);
    if (value.trim()) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
    if (fieldName === "emailID") {
      if (e.target.value !== "" && checkDuplicateEmail(e.target.value)) {
        setDuplicateEmailError("*Email ID already exist");
      } else {
        setDuplicateEmailError("");
      }
    }
    if (fieldName === "organisationName") {
      if (e.target.value !== "" && checkDuplicateOrganisation(e.target.value)) {
        setDuplicateOrganisation("*Organisaiton already exist");
      } else {
        setDuplicateOrganisation("");
      }
    }
  };

  const handleSearch = (e) => {
    const search = e.target.value;
    if (search !== "") {
      filterTableData(search);
    } else {
      setTableData(filterData);
    }
  };

  const filterTableData = (search) => {
    const fileteredData = filterData.filter((table) =>
      Object.values(table).some((value) =>
        String(value).toLowerCase().includes(search.toLowerCase())
      )
    );
    setTableData(fileteredData);
  };

  const handleDelete = async (deleteId) => {
    try {
      const response = await axios.post(`${Environment.BaseAPIURL}/OrgAddandUpdate`,{
        action: "OrgDelete",
        orgId:orgId.current,
        orgName: "",
        orgType: "",
        location: "",
        stateId: null,   
        contactNo: "",
        emailId: "",
        contactPersonName: "",
        loggedInId: null,
        isActive: null
      })
      if(response.data.message === "Deleted Successfully"){
        const tableResponse = await axios.post(
          `${Environment.BaseAPIURL}/GetOrgReportData`,
          { action: "GetOrgReport" }
        );
        const orgResponse = Array.isArray(tableResponse?.data)
          ? tableResponse?.data
          : [];
        setTableData(orgResponse);
        setFilterData(orgResponse);
        setTableDataForDuplicacy(orgResponse);
      }
      else{
        console.log("Organisation can not be deleted")
      }
    } catch (error) {
      console.log("error in deleting the organisation",error)
    }
  }

  const exportToExcel = () => {
    const excelData = tableData.slice();
    const excel = excelData.map((item, index) => ({
      "Sr. no.": index + 1,
      "Organisation Name": item.orgName,
      "Organisation Type": item.orgType,
      State: item.state,
      Location: item.location,
      "Contact No.": item.contactNo,
      "Email ID": item.emailId,
      "Contact Person Name": item.contactPersonName,
    }));

    // Convert JSON to sheet
    const worksheet = XLSX.utils.json_to_sheet(excel, { origin: "A2" }); // Start at A2 to leave space for header
    // Add custom title row
    XLSX.utils.sheet_add_aoa(worksheet, [["Organisation Data"]], {
      origin: "A1",
    });
    // Merge cells for main header across all columns (A1 to I1)
    worksheet["!merges"] = [
      {
        s: { r: 0, c: 0 }, // start cell (row 0, column 0 => A1)
        e: { r: 0, c: 8 }, // end cell (row 0, column 8 => I1)
      },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheet.sheet;charset=UTF-8",
    });
    saveAs(blob, "Organisation Data.xlsx");
  };

  return (
    <div className="main-vendor">
      <Navbar />
      <div className="main-vender-container">
        <form className="vendor-section-1" onSubmit={handleSubmit}>
          <div className="vendor-input">
            <span>
              <FontAwesomeIcon icon={faSitemap} />
            </span>
            <input
              type="text"
              placeholder="Organisation Name"
              value={organisationName}
              onChange={handleInputChange(
                setOrganisationName,
                "organisationName"
              )}
              className={`vendor-input-box ${
                errors.emailID || duplicateOrganisation ? "error-border" : ""
              }`}
            />
            {errors.organisationName && (
              <small className="error-msg">{errors.organisationName}</small>
            )}
            {duplicateOrganisation && (
              <p className="error-msg">{duplicateOrganisation}</p>
            )}
          </div>

          <div className="vendor-input">
            <span>
              <FontAwesomeIcon icon={faBuildingNgo} />
            </span>
            <input
              type="text"
              placeholder="Organisation Type"
              value={organisationType}
              onChange={handleInputChange(
                setOrganisationType,
                "organisationType"
              )}
              className={`vendor-input-box ${
                errors.organisationType ? "error-border" : ""
              }`}
            />
            {errors.organisationType && (
              <small className="error-msg">{errors.organisationType}</small>
            )}
          </div>

          <div className="vendor-input">
            <span>
              <FontAwesomeIcon icon={faMapLocationDot} />
            </span>
            <select
              value={state}
              onChange={handleInputChange(setState, "state")}
              className={`vendor-select-box ${
                errors.state ? "error-border" : ""
              }`}
            >
              <option value="" disabled>
                Select State
              </option>
              {/* <option value="Delhi">Delhi</option>
              <option value="Maharashtra">Maharashtra</option> */}
              {stateCapture.map((item, index) => (
                <option key={index} value={item.id}>
                  {item.state}
                </option>
              ))}
            </select>
            {errors.state && (
              <small className="error-msg">{errors.state}</small>
            )}
          </div>

          <div className="vendor-input">
            <span>
              <FontAwesomeIcon icon={faLocationDot} />
            </span>
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={handleInputChange(setLocation, "location")}
              className={`vendor-input-box ${
                errors.location ? "error-border" : ""
              }`}
            />
            {errors.location && (
              <small className="error-msg">{errors.location}</small>
            )}
          </div>

          <div className="vendor-input">
            <span>
              <FontAwesomeIcon icon={faMobileRetro} />
            </span>
            <input
              type="text"
              placeholder="Contact Number"
              value={contactNo}
              maxLength={10}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  setContactNo(value);
                  if (value.trim()) {
                    setErrors((prev) => ({ ...prev, contactNo: "" }));
                  }
                }
              }}
              className={`vendor-input-box ${
                errors.contactNo ? "error-border" : ""
              }`}
            />
            {errors.contactNo && (
              <small className="error-msg">{errors.contactNo}</small>
            )}
          </div>

          <div className="vendor-input">
            <span>
              <FontAwesomeIcon icon={faAt} />
            </span>
            <input
              type="email"
              placeholder="Email ID"
              value={emailID}
              onChange={handleInputChange(setEmailID, "emailID")}
              className={`vendor-input-box ${
                errors.emailID || duplicateEmailError ? "error-border" : ""
              }`}
            />
            {errors.emailID && (
              <small className="error-msg">{errors.emailID}</small>
            )}
            {duplicateEmailError && (
              <p className="error-msg">{duplicateEmailError}</p>
            )}
          </div>

          <div className="vendor-input">
            <span>
              <FontAwesomeIcon icon={faUserTie} />
            </span>
            <input
              type="text"
              placeholder="Contact Person Name"
              value={contactPersonName}
              onChange={handleInputChange(
                setContactPersonName,
                "contactPersonName"
              )}
              className={`vendor-input-box ${
                errors.contactPersonName ? "error-border" : ""
              }`}
            />
            {errors.contactPersonName && (
              <small className="error-msg">{errors.contactPersonName}</small>
            )}
          </div>

          <div className="vendor-input vendor-button-group">
            {editingIndex !== null && (
              <Switch
                checked={status === 1}
                onChange={() => setStatus(status === 1 ? 0 : 1)}
              />
            )}
            {editingIndex !== null ? (
              <>
                <button
                  type="button"
                  onClick={handleReset}
                  className="user-reset"
                >
                  Reset
                </button>
                <button type="submit" className="user-add">
                  Update
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleReset}
                  className="user-reset"
                >
                  Reset
                </button>
                <button type="submit" className="user-add">
                  Add
                </button>
              </>
            )}
          </div>
        </form>

        <div className="report-container-part-2" style={{ marginTop: "1rem" }}>
          <div className="report-search-button">
            <span className="search-icon">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </span>
            <input
              type="text"
              placeholder="Search"
              className="report-search-input"
              onChange={handleSearch}
            />
          </div>
          <div className="download-excel" onClick={exportToExcel}>
            Export
            <div className="excel-icon-container">
              <img
                src="/images/excel.png"
                alt="excel"
                style={{ height: "100%", width: "100%" }}
              />
            </div>
          </div>
        </div>

        <div className="table-scroll-vertical" style={{ marginTop: "1rem" }}>
          <table>
            <thead>
              <tr>
                <th>Sr. no</th>
                <th>Organisation Name</th>
                <th>Organisation Type</th>
                <th>Location</th>
                <th>State</th>
                <th>Contact No</th>
                <th>Email ID</th>
                <th>Contact Person Name</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((data, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{data.orgName}</td>
                  <td>{data.orgType}</td>
                  <td>{data.location}</td>
                  <td>{data.state}</td>
                  <td>{data.contactNo}</td>
                  <td>{data.emailId}</td>
                  <td>{data.contactPersonName}</td>
                  <td>{data.isActive === 1 ? "Active" : "Inactive"}</td>
                  <td>
                    <FontAwesomeIcon
                      icon={faPenToSquare}
                      style={{
                        cursor: "pointer",
                        marginRight: "10px",
                        fontSize: "1.1rem",
                      }}
                      onClick={() => handleEdit(index)}
                    />
                    {/* <FaEdit style={{ cursor: "pointer", marginRight: "10px" }} 
                    // onClick={() => handleEdit(index)} 
                    /> */}
                    <FontAwesomeIcon
                      icon={faTrash}
                      style={{ cursor: "pointer", fontSize: "1.1rem" }}
                      onClick={() => {orgId.current = data.orgId;  setShowDeleteModal(true)}}
                    />
                    {/* <MdDeleteForever style={{ cursor: "pointer", fontSize: "1.1rem" }}
                    //onClick={() => {setSelectedUserId(data.userId); setSelectedUserIndex(index); setShowDeleteModal(true)}}
                    /> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
      {showModal && (
        <PopUpModal text={text} onClose={() => setShowModal(false)} />
      )}
      {showDeleteModal && (
            <div className="delete-Modal-overLay">
            <div className="delete-modal-content">
            <div className="warning-image"><img src="/images/warning.png" alt="" style={{height:"100%",width:"100%"}}/></div>
            <div className="text-para">Are you sure you want to delete the organisation</div>
            <div className="delete-modal-buttons">
              <button className="yes-button" onClick={() => { handleDelete(deleteId); setShowDeleteModal(false);
                      setText("Organisation deleted successfully"); setShowModal(true); }}>Yes</button>
              <button className="no-button" onClick={() => setShowDeleteModal(false)}>No</button>
            </div>
          </div>
          </div>)}
    </div>
  );
};

export default AddVendor;
