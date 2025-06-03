import React, { lazy, Suspense, useEffect, useState } from "react";
import Spinner from "../component/Spinner";
import "./DeviceRegistration.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faMobileScreenButton,faPrint,faPlaneUp,faFontAwesome,faMagnifyingGlass,faPenToSquare,faTrash} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Environment from "../Environment";
import Switch from "react-switch";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
// import DeviceData from "../Data/DeviceData";
import secureLocalStorage from "react-secure-storage";
import PopUpModal from "../component/PopUpModal";
// import { eachDayOfInterval } from "date-fns";
const Navbar = lazy(() => import("../component/Navbar"));
const Footer = lazy(() => import("../component/Footer"));

const DeviceRegistration = () => {
  const [tableData,setTableData] = useState([]);
  const [filterData,setFilterData] = useState([]);
  const [stationData, setStationData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [station, setStation] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [status, setStatus] = useState(1);
  const [deviceId, setDeviceId] = useState("");
  const [macAdd, setMacAdd] = useState("");
  const [localName, setLocalName] = useState("");
  const [text,setText] = useState("");
  const [deleteData,setDeleteData] = useState([]);
  const [showPopUpModal,setShowPopUpModal] = useState(false);
  const [showDeleteModal,setShowDeleteModal] = useState(false);
  const [emptyFields, setEmptyFields] = useState({
    deviceId: false,
    macAdd: false,
    station: false,
  });
  const IpAddress = secureLocalStorage.getItem("IP")
  const Uid = secureLocalStorage.getItem("UID");
  // console.log(IpAddress,123)

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const response = await axios.post(`${Environment.BaseAPIURL}/GetDestDropdownbind`,{
            action: "GetActiveDestinations",
          });
          const tableResponse = await axios.post(`${Environment.BaseAPIURL}/GetDevicePrinterReport`,{
          "Action":"GetDevicePrinterReport"
        });
        const stationResponse = Array.isArray(response?.data) ? response.data : [];
        setStationData(stationResponse);
        const table = Array.isArray(tableResponse?.data?.data) ? tableResponse.data.data : [];
        console.log("tabe",table)
        setTableData(table);
        setFilterData(table); 
      } catch (error) {
        console.error("Error in fetching station data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleInputChange = (setter, field) => (e) => {
    const value = e.target.value;
    setter(value);
    if (value !== "") {
      setEmptyFields((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleSearch = (e) => {
    const search = e.target.value;
    if(search !== ''){
      searchHandler(search);
    }
    else{
      setTableData(filterData);
    }
  }

  const searchHandler = (search) => {
    const filter = filterData.filter((data)=>Object.values(data).some((value)=>String(value).toLowerCase().includes(search.toLowerCase())));
    setTableData(filter);
  }

  const excelDownload = () => { 
    const excelData = tableData.slice();
    const excel = excelData.map((data,index)=>({
      "Sr. No.": index + 1,
      "Device Id":data.deviceID,
      "Printer Mac Address":data.printerMacId,
      "Station":data.destinationCode,
      "Local Name": data.localName,
      "Created Date":data.createdOn,
      "Status":data.isActive === 1 ? "Active":"Inactive"
    }))

    const worksheet = XLSX.utils.json_to_sheet(excel,{ origin: "A2"});
    XLSX.utils.sheet_add_aoa(worksheet,[["Device List with Printers"]],{origin:"A1"})
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
    saveAs(blob, "Device List with Printers.xlsx");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasEmptyField = false;
    const newEmptyFields = { ...emptyFields };

    if (!deviceId) {
      newEmptyFields.deviceId = true;
      hasEmptyField = true;
    }

    if (!macAdd) {
      newEmptyFields.macAdd = true;
      hasEmptyField = true;
    }

    if (!station) {
      newEmptyFields.station = true;
      hasEmptyField = true;
    }

    setEmptyFields(newEmptyFields);
    if (hasEmptyField) return;

    const formData = {
         "Action": editingIndex !== null ? "UpdateDevice":"InsertDevice",
         "DeviceID": deviceId,
         "PrinterMacId": macAdd,
         "Station": station,
         "LocalName": localName,
         "Createdby": Uid,
         "IsActive": status
    };
    console.log("Form Submitted:", formData);
    // API call
    setLoading(true);
    try {
      const response = await axios.post(`${Environment.BaseAPIURL}/InsertDevicePrinter`,{
         "Action": editingIndex !== null ? "UpdateDevice":"InsertDevice",
         "DeviceID": deviceId,
         "PrinterMacId": macAdd,
         "Station": parseInt(station),
         "LocalName": localName,
         "Createdby": Uid,
         "IsActive": status
      })
      if(response?.data?.response === "true"){
        // console.log("ipadd",IpAddress)
        setShowPopUpModal(true);
        setText(editingIndex!==null?"Device updated successfully":"Device added successfully");
        const id = response?.data?.id
        const insertData = await axios.post(`${Environment.BaseAPIURL}/InsertAuditReport`,{
               "IpAddress": IpAddress,
               "Action": editingIndex!==null ? "Update Device" : "Add Device",
               "ProcessName": editingIndex!==null ? "Device updated successfully" : "Device added successfully",
               "UserId": id,
               "CreatedBy":Uid,
               "TemplateId": editingIndex!==null ? "UpdateDevice" : "AddDevice"
            })
        const tableResponse = await axios.post(`${Environment.BaseAPIURL}/GetDevicePrinterReport`,{
          "Action":"GetDevicePrinterReport"
        });
        const table = Array.isArray(tableResponse?.data?.data) ? tableResponse?.data?.data : [];
        setTableData(table);
        setFilterData(table); 
      }
      else{
        console.log("Device id is not found")
      }
      setLoading(false);
    } catch (error) {
      console.log("error in adding/updating device",error);
      setLoading(false);
    }
    handleReset();
  };

  const handleEdit = (index) => {
    const editData = tableData[index];
    console.log("editData",editData)
    const matchingStation = stationData.find((station) => station.destinationCode === editData.destinationCode);
    const destinationId = matchingStation?.destinationId;
    // console.log("Destination ID:", destinationId);
    if(editData){
    setDeviceId(editData.deviceID);
    setMacAdd(editData.printerMacId);
    setStation(destinationId);
    setLocalName(editData.localName)
    setStatus(editData.isActive)
    setEditingIndex(index);
    setEmptyFields({
    deviceId: false,
    macAdd: false,
    station: false,
    })
    }
    else{
      console.log("edit device not found")
    }
    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  const handleReset = () => {
    setDeviceId("");
    setMacAdd("");
    setStation("");
    setLocalName("");
    setStatus(1);
    setEditingIndex(null);
    setEmptyFields({ deviceId: false, macAdd: false, station: false });
  };

  const handleDelete = async (deleteData) => {
    console.log("delte data",deleteData);
    const matchingStation = stationData.find((station) => station.destinationCode === deleteData.destinationCode);
    const destinationId = matchingStation?.destinationId;
    if(deleteData){
      setLoading(true)
      const deleteDataa = await axios.post(`${Environment.BaseAPIURL}/InsertDevicePrinter`,{
        "Action": "DeleteDevice",
        "DeviceID": deleteData.deviceID,
        "PrinterMacId": deleteData.printerMacId,
        "Station": destinationId,
        "LocalName": deleteData.localName,
        "Createdby": Uid,
        "IsActive": deleteData.isActive
    })
    if(deleteDataa?.data?.response){
      const id = deleteDataa?.data?.id;
      setText("Device deleted successfully")
      setShowPopUpModal(true);
      const insertData = await axios.post(`${Environment.BaseAPIURL}/InsertAuditReport`,{
               "IpAddress": IpAddress,
               "Action": "Delete Device",
               "ProcessName": "Device deleted successfully",
               "UserId": id,
               "CreatedBy":Uid,
               "TemplateId": "DeleteDevice"
            })
         const tableResponse = await axios.post(`${Environment.BaseAPIURL}/GetDevicePrinterReport`,{
         "Action":"GetDevicePrinterReport"
         });
        const table = Array.isArray(tableResponse?.data?.data) ? tableResponse?.data?.data : [];
        setTableData(table);
        setFilterData(table);  
        setLoading(false);
    }
    else{
      console.log("data can not be deleted")
      setLoading(false);
    }
    }
    else{
      console.log("deleted device not found")
    }
  }

  return (
    <Suspense fallback={<Spinner />}>
      {loading && <Spinner />}
      <Navbar />
      <div className="Device-container">
        <form className="Device-container-upper-part" onSubmit={handleSubmit}>
          <div className="Device-container-upper-part-A">
            <div className="device-boxes">
              <span>
                <FontAwesomeIcon icon={faMobileScreenButton} />
              </span>
              <input
                type="text"
                placeholder="Enter Device ID"
                value={deviceId}
                onChange={handleInputChange(setDeviceId, "deviceId")}
                className={`device-input ${
                  emptyFields.deviceId ? "error-border" : ""
                }`}
              />
              {emptyFields.deviceId && (
                <div className="error-message">*Device ID is required</div>
              )}
            </div>

            <div className="device-boxes">
              <span>
                <FontAwesomeIcon icon={faPrint} />
              </span>
              <input
                type="text"
                placeholder="Enter Printer MAC ID"
                value={macAdd}
                onChange={handleInputChange(setMacAdd, "macAdd")}
                className={`device-input ${
                  emptyFields.macAdd ? "error-border" : ""
                }`}
              />
              {emptyFields.macAdd && (
                <div className="error-message">*MAC Address is required</div>
              )}
            </div>

            <div className="device-boxes">
              <span>
                <FontAwesomeIcon icon={faPlaneUp} />
              </span>
              <select
                value={station}
                onChange={handleInputChange(setStation, "station")}
                className={`device-input ${
                  emptyFields.station ? "error-border" : ""
                }`}
              >
                <option value="" disabled>Select Station</option>
                {stationData.map((station, index) => (
                  <option key={index} value={station.destinationId}>
                    {station.destinationCode}
                  </option>
                ))}
              </select>
              {emptyFields.station && (
                <div className="error-message">*Station is required</div>
              )}
            </div>

            <div className="device-boxes">
              <span>
                <FontAwesomeIcon icon={faFontAwesome} />
              </span>
              <input
                type="text"
                placeholder="Local Device Name"
                value={localName}
                onChange={handleInputChange(setLocalName, "")}
                className="device-input"
              />
            </div>
          </div>

          <div className="user-form-lower-part">
            {editingIndex !== null && (
              <Switch
                checked={status === 1}
                onChange={() => setStatus((prev) => (prev === 1 ? 0 : 1))}
              />
            )}
            <button type="button" onClick={handleReset} className="user-reset">
              Reset
            </button>
            <button type="submit" className="user-add">
              {editingIndex !== null ? "Update" : "Add"}
            </button>
          </div>
        </form>
        {/* the below part is styled using audit report css */}
        <div className="audit-functionality">
          <div className="report-search-button" style={{ height: "44px" }}>
            <span className="search-icon">
              {/* <IoSearchSharp /> */}
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </span>
            <input
              type="text"
              placeholder="Search"
              onChange={handleSearch}
              className="report-search-input"
            />
          </div>
          <div className="download-excel-audit" onClick={excelDownload}>
            Export
            <div className="excel-icon-container">
              <img
                src="/images/excel.png"
                alt=""
                style={{ height: "100%", width: "100%" }}
              />
            </div>
          </div>
        </div>
        <div className="table-scroll-vertical">
                  <table style={{ position: "relative" }}>
                    <thead>
                      <tr>
                        <th>Sr. no</th>
                        <th>Device ID</th>
                        <th>Printer Mac ID</th>
                        <th>Station</th>
                        <th>Local Name</th>
                        <th>Created On Date/Time</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                     {tableData.map((data,index)=>(<tr>
                      <td>{index+1}</td>
                      <td>{data.deviceID}</td>
                      <td>{data.printerMacId}</td>
                      <td>{data.destinationCode}</td>
                      <td>{data.localName}</td>
                      <td>{data.createdOn}</td>
                      <td>{data.isActive === 1 ? "Active":"Inactive"}</td>
                      <td> <FontAwesomeIcon icon={faPenToSquare} style={{ cursor: "pointer", marginRight: "10px",fontSize: "1.1rem" }} onClick={() => handleEdit(index)}/>
                                              <FontAwesomeIcon icon={faTrash} style={{ cursor: "pointer", fontSize: "1.1rem" }}
                                              onClick={() => {setDeleteData(data); setShowDeleteModal(true)}}
                                              /></td>
                     </tr>))}
                    </tbody>
                  </table>
                </div>
      </div>
      <Footer />
      {showPopUpModal && <PopUpModal text={text} onClose={()=>setShowPopUpModal(false)}/>}
        {showDeleteModal && (
            <div className="delete-Modal-overLay">
            <div className="delete-modal-content">
            <div className="warning-image"><img src="/images/warning.png" alt="" style={{height:"100%",width:"100%"}}/></div>
            <div className="text-para">Are you sure you want to delete the device?</div>
            <div className="delete-modal-buttons">
              <button className="yes-button" onClick={() => {handleDelete(deleteData);setShowDeleteModal(false);}}>Yes</button>
              <button className="no-button" onClick={() => setShowDeleteModal(false)}>No</button>
            </div>
          </div>
          </div>)}
    </Suspense>
  );
};                

export default DeviceRegistration;
