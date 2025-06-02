import React, { useState, useRef, useEffect } from "react";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
// import { IoSearchSharp } from "react-icons/io5";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons';
// import AuditData from "../Data/AuditData";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import Environment from "../Environment";
import Spinner from "../component/Spinner";

const AuditReport = () => {
  const [startDate, setStartDate] = useState(() => {
    const defaultDate = new Date();
    defaultDate.setHours(0, 0, 0, 0);
    return defaultDate;
  });
  const [endDate, setEndDate] = useState(() => new Date());

  const datePickerRef = useRef(null);
  const handleStartDateChange = (date) => setStartDate(date);
  const handleEndDateChange = (date) => setEndDate(date);
  const openCalendar = () => datePickerRef.current.setFocus(); // focus input to open calendar
  const [tableData, setTableData] = useState([]);
  const [fiterData, setFilteredData] = useState([]);
  const [loading,setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const toggleDescription = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  const getShortnerText = (text) => {
    if (text.length <= 50) {
      return text;
    }
    return text.slice(0, 50) + " ...";
  };

    const today = startDate
      ? `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(startDate.getDate()).padStart(2, "0")}`
      : "";
      const end = endDate
      ? `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(endDate.getDate()).padStart(2, "0")}`
      : "";

  const handleSearch = (e) => {
    const search = e.target.value;
    if (search !== "") {
      filterTableData(search);
    } else {
      setTableData(fiterData);
    }
  };
  const filterTableData = (search) => {
    const filtered = fiterData.filter((data) =>
      Object.values(data).some((value) =>
        String(value).toLowerCase().includes(search.toLowerCase())
      )
    );
    setTableData(filtered);
  };

  const excelDownload = () => {
    const excelData = tableData.slice();
    const excel = excelData.map((item, index) => ({
      "Sr. no.": index + 1,
      "IP Address": item.ipAddress,
      "Action": item.action,
      "Process description": item.processDescription,
      "Process name": item.processName,
      "Added/Modified by": item.userName,
      "Date/Time": item.createdOn,
    }));

    // Convert JSON to sheet
    const worksheet = XLSX.utils.json_to_sheet(excel, { origin: "A2" }); // Start at A2 to leave space for header
    // Add custom title row
    XLSX.utils.sheet_add_aoa(worksheet, [["Audit Report"]], {
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
    saveAs(blob, "Audit Report.xlsx");
  };

const formatDate = (date) => {
  return date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    : "";
};

useEffect(() => {
  // Fetch today's data on mount
  setLoading(true)
  const fetchTodayData = async () => {
    const formattedStart = formatDate(new Date());
    const formattedEnd = formatDate(new Date());  

    try {
      const response = await axios.post(`${Environment.BaseAPIURL}/GetAuditReport`, {
        fromDate: formattedStart,
        toDate: formattedEnd,
      });

      const auditData = Array.isArray(response?.data) ? response.data : [];
      setTableData(auditData);
      setFilteredData(auditData);
      setLoading(false);
    } catch (error) {
      console.log("Error fetching audit report:", error);
      setLoading(false);
    }
  };

  fetchTodayData();
}, []);

const handleSubmit = async (e) => {
  e.preventDefault();
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);
  setLoading(true);
  try {
    const response = await axios.post(`${Environment.BaseAPIURL}/GetAuditReport`, {
      fromDate: formattedStartDate,
      toDate: formattedEndDate,
    });
    const auditData = Array.isArray(response?.data) ? response.data : [];
    setTableData(auditData);
    setFilteredData(auditData);
    setLoading(false);
  } catch (error) {
    console.error("Error fetching audit report data:", error);
    setLoading(false);
  }
};

  return (
    <>
     {loading && <Spinner/>}
    <div className="Audit-report-main-container">
      <Navbar />
      <div className="Audit-report-container">
        <form className="audit-feature-section" onSubmit={handleSubmit}>
          <div className="audit-datepicker start-date-dropdown">
            <label htmlFor="start-date" className="Audit-date-label">
              From Date
            </label>
            <div className="audit-datepicker-wrapper">
              <FaCalendarAlt className="calendar-icon" onClick={openCalendar} />
              <DatePicker
                id="start-date"
                selected={startDate}
                onChange={handleStartDateChange}
                // showTimeSelect
                // timeFormat="HH:mm"
                // timeIntervals={15}
                // timeCaption="Time"
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
              <FaCalendarAlt className="calendar-icon" onClick={openCalendar} />
              <DatePicker
                id="start-date"
                selected={endDate}
                onChange={handleEndDateChange}
                // showTimeSelect
                // timeFormat="HH:mm"
                // timeIntervals={15}
                // timeCaption="Time"
                // dateFormat="dd-MM-yyyy HH:mm"
                className="audit-datepick"
                maxDate={new Date()}
                ref={datePickerRef}
              />
            </div>
          </div>
          <button type="submit" className="submit-audit-form-button">Submit</button>
        </form>

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
              {/* <RiFileExcel2Line className="excel-icon" />  */}
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
          <table>
            <thead>
              <tr>
                <th>Sr. no</th>
                <th>IP Address</th>
                <th>Action</th>
                <th>Process description</th>
                <th>Process name</th>
                <th>Added/Modified by</th>
                <th>Date/Time</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((data, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{data.ipAddress}</td>
                  <td>{data.action}</td>
                  <td style={{textAlign:"left"}}>
                    {expandedRows[index]
                      ? data.processDescription
                      : getShortnerText(data.processDescription)}
                    {data.processDescription.split("").length > 50 && (
                      <span
                        onClick={() => toggleDescription(index)}
                        style={{
                          color: "#007bff",
                          cursor: "pointer",
                          marginLeft: "6px",
                          fontWeight: 500,
                        }}
                      >
                        {expandedRows[index] ? " Show less" : " Read more"}
                      </span>
                    )}
                  </td>
                  <td>{data.processName}</td>
                  <td>{data.userName}</td>
                  <td>{data.createdOn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
    </>
  );
};

export default AuditReport;
