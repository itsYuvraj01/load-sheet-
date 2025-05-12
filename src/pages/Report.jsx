import React, { useRef, useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Report.css";
import { FaCalendarAlt } from "react-icons/fa";
import { IoSearchSharp } from "react-icons/io5";
import { RiFileExcel2Line } from "react-icons/ri";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import data from "../Data/Data";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Environment from "../Environment";
import axios from "axios";
import Spinner from "../component/Spinner";

const Report = () => {
  // console.log("environmernt",Environment)
  const [startDate, setStartDate] = useState(() => {
    const defaultDate = new Date();
    defaultDate.setHours(0, 0, 0, 0);
    return defaultDate;
  });
  const [dateData,setDateData] = useState("")
  const [selectedStation, setSelectedStation] = useState("");
  const [selectedFlight, setSelectedFlight] = useState("");
  const [stationData, setStationData] = useState([]);
  const [flightData, setFlightData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [filterData,setFilterData] = useState([]);
  const [loading,setLoading] = useState(false);
  // api to get station drop down data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await axios.post(
          `${Environment.BaseAPIURL}/GetPrintLoadSheetDt`,
          {
            action: "GetDestinations",
          }
        );
        // console.log("station drop down", response?.data);
        const arrayData = Array.isArray(response?.data) ? response?.data : [];
        setStationData(arrayData);
        // console.log("sta", stationData);
        setLoading(false)
      } catch (error) {
        console.log("error in fetching stations", error);
        setLoading(false)
      }
    };
    fetchData();
  }, []);
  // api to get flight data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await axios.post(
          `${Environment.BaseAPIURL}/GetPrintLoadSheetDt`,
          {
            Action: "GetFlightNos",
            Destination: selectedStation ? selectedStation : "",
          }
        );

        // console.log("flight", response?.data);
        const flight = Array.isArray(response?.data) ? response?.data : [];
        setFlightData(flight);
         setLoading(false);
      } catch (error) {
        console.log("error in fetching flights", error);
         setLoading(false);
      }
    };
    fetchData();
  }, [selectedStation]);

  const handleStartDateChange = (date) => {
    console.log("current date", date);
    setStartDate(date);
  };
  const handleStationChange = (e) => {
    setSelectedStation(e.target.value);
  };
  const handleFlightChange = (e) => {
    setSelectedFlight(e.target.value);
  };

  const formatDate = (date) => {
    return date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      : '';
  };

  // to get table data on page refresh
  const fetchData = async (date = '', station = '', flight = '') => {
    const currentDate = date || formatDate(new Date());
    setDateData(currentDate);
    setLoading(true);
    try {
      const response = await axios.post(`${Environment.BaseAPIURL}/GetPrintLoadSheetDt`, {
        "Action": 'GetReport',
        "printDateTime": currentDate,
        "Destination": station,
        "FlightNo": flight,
      });
      console.log('table data', response?.data);
      const tablereport = Array.isArray(response?.data) ? response?.data : []
      setTableData(tablereport);
      setFilterData(tablereport);
      setLoading(false);
    } catch (error) {
      console.log('error in fetching report table data', error);
       setLoading(false)
    }
  };

  useEffect(() => {
    fetchData(); 
  }, []);

  // to get table data
  const handleSubmit = (e) => {
    e.preventDefault();
  
    const today = startDate
      ? `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`
      : '';
  
    setDateData(today);
    fetchData(today, selectedStation || '', selectedFlight || '');
  };
  

  // const [pageSize, setPageSize] = useState(10);
  const tableRef = useRef();
  const [searchTerm, setSearchTerm] = useState("");

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

  const exportToExcel = () => {
    const excelData = tableData.slice();
    const excel = excelData.map((item, index) => ({
      "Sr. no.": index + 1,
      "Date": dateData,
      "Flight No": item.flightNo,
      "Sector": item.destination,
      "LoadSheet Name": item.loadsheetname,
      "LoadSheet Recieve Date/Time": item.loadsheetrecievedDatetime,
      "LoadSheet Print Date/Time": item.printDateTime,
      "Printer Mac Address/ID": item.printMacAddress,
      "UserId": item.userId,
      // "Prints count": item["No-of-Prints"],
    }));
    const worksheet = XLSX.utils.json_to_sheet(excel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheet.sheet;charset=UTF-8",
    });
    // Use dynamic name
    saveAs(blob, "Load Sheet Report.xlsx");
  };

  return (
    <>
    {loading && <Spinner/>}
    <div>
      <Navbar />
      <div className="report-top-container">
        <div className="report-container">
         <form className="report-container-part-1" onSubmit={handleSubmit}>
  <div className="report-datepicker-container">
    <label htmlFor="start-date" className="report-label">Start Date</label>
    <span className="calender">
      <FaCalendarAlt />
    </span>
    <DatePicker
      id="start-date"
      selected={startDate}
      onChange={handleStartDateChange}
      selectsStart
      placeholderText="Select start date and time"
      dateFormat="dd-MM-yyyy"
      className="datepick"
      maxDate={new Date()}
    />
  </div>

  <div className="report-datepicker-container">
    <label htmlFor="station-select" className="report-label">Select Station</label>
    <select
      id="station-select"
      className="report-search-input"
      value={selectedStation}
      onChange={handleStationChange}
    >
      <option value="">All Stations</option>
      {stationData.map((item, index) => (
        <option key={index} value={item.destination}>
          {item.destination}
        </option>
      ))}
    </select>
  </div>

  <div className="report-datepicker-container">
    <label htmlFor="flight-select" className="report-label">Select Flight</label>
    <select
      id="flight-select"
      className="report-search-input"
      value={selectedFlight}
      onChange={handleFlightChange}
    >
      <option value="">All Flights</option>
      {flightData.map((data, index) => (
        <option key={index} value={data.flightNo}>
          {data.flightNo}
        </option>
      ))}
    </select>
  </div>

  <button className="report-submit-button" type="submit">
    Submit
  </button>
</form>

          <div className="report-container-part-2">
            <div className="report-search-button">
              <span className="search-icon">
                <IoSearchSharp />
              </span>
              <input
                type="text"
                placeholder="Search your result here"
                onChange={handleSearch}
                className="report-search-input"
              />
            </div>
            <div className="download-excel" onClick={exportToExcel}>
              <RiFileExcel2Line className="excel-icon" /> Export As
            </div>
          </div>
        </div>
        <div className="table-scroll-vertical">
          <table ref={tableRef}>
            <thead>
              <tr>
                <th>Sr. no</th>
                <th>Date</th>
                <th>Flight No.</th>
                <th>Sector</th>
                <th>LoadSheet Name</th>
                <th>LoadSheet Recieve Date/Time</th>
                <th>LoadSheet Print Date/Time</th>
                <th>Printer Mac Address/ID</th>
                <th>UserId</th>
                {/* <th>Prints count</th> */}
              </tr>
            </thead>
            <tbody>
              {tableData.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{dateData}</td>
                  <td>{item.flightNo}</td>
                  <td>{item.destination}</td>
                  <td>{item.loadsheetname}</td>
                  <td>{item.loadsheetrecievedDatetime}</td>
                  <td>{item.printDateTime}</td>
                  <td>{item.printMacAddress}</td>
                  <td>{item.userId}</td>
                  {/* <td>{item["No-of-Prints"]}</td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* <div>Pagination</div> */}
      </div>
      <Footer />
    </div>
    </>
  );
};

export default Report;

//
// GetAllFlightNos

// const handleSearchChange = (e) => {
//     const searchTerm = e.target.value;
//     setSearchTerm(searchTerm);
//     filterFirstTableData(searchTerm); // Only filters first table data
//   };

//   const filterFirstTableData = (searchTerm) => {
//     const filtered = originalFirstTableData.filter((passenger) =>
//       Object.values(passenger).some(
//         (value) =>
//           typeof value === "string" &&
//           value.toLowerCase().includes(searchTerm.toLowerCase())
//       )
//     );
//     setFilteredData(filtered);
//     setCurrentPage(0);
//     setDisplayedData(filtered.slice(0, pageSize));
//   };

// const exportToExcel2 = () => {
//     const reversedData = selectedFD.slice();
//     // .reverse();

//     const dataToExportForTable2 = reversedData.map((data, index) => ({
//       "Sl. No.": index + 1,
//       "Feedback Date-time": data.FeedbackDateTime,
//       "CISF-Name": data.CISFName,
//       "CISF-ID": data.CISFID,
//       "CISF Feedback Category": data.FeedbackCategory,
//       "Feedback Remark": data.Remarks,
//       "User ID": data.UserId,
//       "Tablet Id": data.TabletID,
//       "CheckPoint Location Name": data.CheckpointName,
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(dataToExportForTable2);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

//     const excelBuffer = XLSX.write(workbook, {
//       bookType: "xlsx",
//       type: "array",
//     });

//     const blob = new Blob([excelBuffer], {
//       type: "application/vnd.openxmlformats-officedocument.spreadsheet.sheet;charset=UTF-8",
//     });

//     // Get CISF Name from the first entry
//     const reportName =
//       reversedData.length > 0 ? reversedData[0].CISFName : "CISF";

//     // Use dynamic name
//     saveAs(blob, `${reportName} Detailed Feedback Report.xlsx`);
//   };

/* <Dropdown.Item onClick={exportToExcel2}>
<FaFileExcel style={{ color: "green" }} />{" "}
Excel
</Dropdown.Item> */

// const addTime = (date, hours, minutes, seconds) => {
//     const newDate = new Date(date);
//     newDate.setHours(newDate.getHours() + hours);
//     newDate.setMinutes(newDate.getMinutes() + minutes);
//     newDate.setSeconds(newDate.getSeconds() + seconds);

//     const year = newDate.getFullYear();
//     const month = String(newDate.getMonth() + 1).padStart(2, "0");
//     const day = String(newDate.getDate()).padStart(2, "0");
//     const hoursStr = String(newDate.getHours()).padStart(2, "0");
//     const minutesStr = String(newDate.getMinutes()).padStart(2, "0");
//     const secondsStr = String(newDate.getSeconds()).padStart(2, "0");

//     return `${day}-${month}-${year} ${hoursStr}:${minutesStr}:${secondsStr}`;
//   };
