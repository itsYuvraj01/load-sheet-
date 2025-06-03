import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import "../component/Footer.css";
import "../component/Navbar.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faMagnifyingGlass,faEye,faDownload} from "@fortawesome/free-solid-svg-icons";
import Spinner from "../component/Spinner";
// import flightData from "../Data/ImageReportData";
// import { ImageDownloader } from "@samvera/image-downloader";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import Environment from "../Environment";
const Navbar = lazy(() => import("../component/Navbar"));
const Footer = lazy(() => import("../component/Footer"));

const ImageReport = () => {
  const datePickerRef = useRef(null);
  const openCalendar = () => datePickerRef.current.setFocus(); // focus input to open calendar
  // const [startDate, setStartDate] = useState(() => {
  //     const defaultDate = new Date();
  //     defaultDate.setHours(0, 0, 0, 0);
  //     return defaultDate;
  //   });
  const [startDate,setStartDate] = useState(() => new Date());
  const [endDate, setEndDate] = useState(() => new Date());
  const handleStartDateChange = (date) => setStartDate(date);
  const handleEndDateChange = (date) => setEndDate(date);
  const [tableData, setTableData] = useState([]);
  const [filterData,setFilterData] = useState([]);
  const [loading,setLoading]= useState(false);
  const [imageModal, setImageModal] = useState(null);
  let serialNo = 0;
  let previousFlightNo = "";

  const formatDate = (date) => {
  return date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    : "";
  };

useEffect(()=>{
  setLoading(true);
  const fetchData = async () => {
    const start = formatDate(new Date());
    const end = formatDate(new Date());
    try {
      const response = await axios.post(`${Environment.BaseAPIURL}/GetImageReport`,{
        "fromDate":start,
        "toDate":end
      });
      // console.log("image report",response?.data)
      const imageReport = Array.isArray(response?.data) ? response?.data : [];
      setTableData(imageReport);
      setFilterData(imageReport);
      setLoading(false);
    } catch (error) {
      console.log("Can not fetch image report",error);
      setLoading(false);
    }
  };
  fetchData();
 },[])

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    };
    setLoading(true);
    try {
      const response = await axios.post(`${Environment.BaseAPIURL}/GetImageReport`,{
        "fromDate":formatDate(startDate),
        "toDate":formatDate(endDate)
      });
      const imageReport = Array.isArray(response?.data) ? response?.data : [];
      setTableData(imageReport);
      setFilterData(imageReport);
      setLoading(false);
    } catch (error) {
      console.log("Can not fetch image report",error);
      setLoading(false);
    }
    // console.log("form data", formData);
  };

 const detectMimeType = (base64) => {
  if (base64.startsWith("/9j/")) return "image/jpeg";
  if (base64.startsWith("iVBORw0KGgo")) return "image/png";
  if (base64.startsWith("R0lGODdh") || base64.startsWith("R0lGODlh")) return "image/gif";
  if (base64.startsWith("Qk0")) return "image/bmp";
  return "application/octet-stream";
};

const downloadBase64File = (base64Data, filename) => {
  const mimeType = detectMimeType(base64Data);
  const link = document.createElement("a");
  link.href = `data:${mimeType};base64,${base64Data}`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const handleSearch = (e) => {
  const search = e.target.value;
  if(search !== ''){
    filterForTable(search);
  }
  else{
    setTableData(filterData);
  }
};

const filterForTable = (search) => {
  const filtered = filterData.filter((data)=> Object.values(data).some((value)=>String(value).toLowerCase().includes(search.toLowerCase())));
  setTableData(filtered);
}

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  
  const formattedDate = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true, // change to false for 24-hour format
  });

  return `${formattedDate} ${formattedTime}`;
};

const excelDownload = () => {
    const excelData = tableData.slice();
    const excel = excelData.map((item, index) => ({
      "Sr. no.": index + 1,
      "Departure Date": formatTimestamp(item.flightDate),
      "Flight No": item.flightNo,
      "Origin": item.fromAirport,
      "Destination": item.toAirport,
      "Load Sheet Name": item.loadsheetname,
      "Load Sheet Print Date/Time": formatTimestamp(item.printDateTime),
      "Load Sheet Upload Date/Time": formatTimestamp(item.createdDateTime),
      "User Id": item.userId,
    }));

    // Convert JSON to sheet
    const worksheet = XLSX.utils.json_to_sheet(excel, { origin: "A2" }); // Start at A2 to leave space for header
    // Add custom title row
    XLSX.utils.sheet_add_aoa(worksheet, [["Load Sheet Image Report"]], {
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
    saveAs(blob, "Load Sheet Image Report.xlsx");
  };

  return (
    <Suspense fallback={<Spinner />}>
      {loading && <Spinner/>}
      <Navbar />
      <div className="Image-report-container">
        <div className="Image-report-upper">
          <form className="audit-feature-section" onSubmit={handleSubmit}>
            <div className="audit-datepicker start-date-dropdown">
              <label htmlFor="start-date" className="Audit-date-label">
                From Date
              </label>
              <div className="audit-datepicker-wrapper">
                <FaCalendarAlt
                  className="calendar-icon"
                  onClick={openCalendar}
                />
                <DatePicker
                  id="start-date"
                  selected={startDate}
                  onChange={handleStartDateChange}
                  // showTimeSelect
                  // timeFormat="HH:mm"
                  // timeIntervals={15}
                  // timeCaption="Time"
                  dateFormat="yyyy-MM-dd"
                  // dateFormat="dd-MM-yyyy HH:mm"
                  className="audit-datepick"
                  maxDate={new Date()}
                  ref={datePickerRef}
                />
              </div>
            </div>
            <div className="audit-datepicker start-date-dropdown">
              <label htmlFor="start-date" className="Audit-date-label">
                To Date
              </label>
              <div className="audit-datepicker-wrapper">
                <FaCalendarAlt
                  className="calendar-icon"
                  onClick={openCalendar}
                />
                <DatePicker
                  id="start-date"
                  selected={endDate}
                  onChange={handleEndDateChange}
                  // showTimeSelect
                  // timeFormat="HH:mm"
                  // timeIntervals={15}
                  // timeCaption="Time"
                  dateFormat="yyyy-MM-dd"
                  className="audit-datepick"
                  maxDate={new Date()}
                  ref={datePickerRef}
                />
              </div>
            </div>
            <button type="submit" className="submit-audit-form-button">
              Submit
            </button>
          </form>
        </div>
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
            {/* <RiFileExcel2Line className="excel-icon" />onClick={excelDownload}  */}
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
                <th>Departure Date</th>
                <th>Flight No</th>
                <th>Origin</th>
                <th>Destination</th>
                {/* <th>STD</th> */}
                <th>Load Sheet Name</th>
                <th>Load Sheet Print Time</th>
                <th>Load Sheet Upload Time</th>
                <th>User Details</th>
                <th>Images</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((flight, index) => {
                let showSrNo = false;
                if (flight.flightNo !== previousFlightNo) {
                  serialNo += 1;
                  previousFlightNo = flight.flightNo;
                  showSrNo = true;
                }

                return (
                  <tr key={index}>
                    <td>{showSrNo ? serialNo : ""}</td>
                    <td>{formatTimestamp(flight.flightDate)}</td>
                    <td>{flight.flightNo}</td>
                    <td>{flight.fromAirport}</td>
                    <td>{flight.toAirport}</td>
                    {/* <td>{flight.std}</td> */}
                    <td>{flight.loadsheetname}</td>
                    <td>{formatTimestamp(flight.printDateTime)}</td>
                    <td>{formatTimestamp(flight.createdDateTime)}</td>
                    <td>{flight.userId}</td>
                    <td>
                      <FontAwesomeIcon
                        icon={faEye}
                        title="View"
                        style={{ marginRight: "1rem", cursor: "pointer" }}
                        onClick={() => {
                          const mimeType = detectMimeType(flight.imageFile);
                          const dataUrl = `data:${mimeType};base64,${flight.imageFile}`;
                          setImageModal(dataUrl);
                        }}/>
                        <FontAwesomeIcon
                          icon={faDownload}
                          title="download"
                          onClick={() => downloadBase64File(flight.imageFile, `image-Load shhet.jpg`)} 
                          style={{
                            color: "#333",
                            fontSize: "18px",
                            transition: "0.3s",
                            cursor:"pointer"
                          }}/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
      {imageModal && (
        <div
          className="image-modal-overlay"
          onClick={() => setImageModal(null)}
        >
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
             <img src={imageModal} alt="View Image" className="modal-image" />
            {/* <button className="close-modal-btn" onClick={() => setImageModal(null)}>X</button> */}
          </div>
        </div>
      )}
    </Suspense>
  );
};

export default ImageReport;
