import React, { useRef, useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Report.css";
// import { FaCalendarAlt } from "react-icons/fa";
// import { IoSearchSharp } from "react-icons/io5";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faMagnifyingGlass,faCalendarDays} from '@fortawesome/free-solid-svg-icons';
// import { RiFileExcel2Line } from "react-icons/ri";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
// import data from "../Data/Data";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Environment from "../Environment";
import axios from "axios";
import Spinner from "../component/Spinner";

const Report = () => {
  //initial date selection in calender input
  const [startDate, setStartDate] = useState(() => {
    const defaultDate = new Date();
    defaultDate.setHours(0, 0, 0, 0);
    return defaultDate;
  });
  const [dateData, setDateData] = useState("");                     //set date in actual api payload date format
  const [selectedStation, setSelectedStation] = useState("");       //to store which station is selected
  const [selectedFlight, setSelectedFlight] = useState("");         //to store which flight is selected
  const [stationData, setStationData] = useState([]);               //it stores the station dropdown data
  const [flightData, setFlightData] = useState([]);                 //it stores the flight dropdown data
  const [tableData, setTableData] = useState([]);                   //it stores the loadsheet api data for table
  const [filterData, setFilterData] = useState([]);                 //it is used to make filtration in table data
  const [loading, setLoading] = useState(false);                    //loader
  const [isVisible,setIsVisible] = useState(null)
  const [detailData,setDetailData] = useState([]);
  const [secondTableData,setSecondTableData] = useState([]);

  // api to get station drop down data
  // useEffect(() => {
  //   const fetchAllData = async () => {
  //     setLoading(true);
      
  //   };
  //   fetchAllData();
  // }, []);  

  // api to get flight data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.post(
          `${Environment.BaseAPIURL}/GetPrintLoadSheetDt`,
          {
            Action: "GetFlightNos",
            Destination: selectedStation ? selectedStation : "",
          }
        );
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

  // keep track of station, flight and date change
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

  // change the date in actual date format for api payload
  const formatDate = (date) => {
    return date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(date.getDate()).padStart(2, "0")}`
      : "";
  };

  // to get table data on page refresh
  const fetchData = async (date = "", station = "", flight = "") => {
    const currentDate = date || formatDate(new Date());
    setDateData(currentDate);
    setLoading(true);
    try {
      const response = await axios.post(
        `${Environment.BaseAPIURL}/GetPrintLoadSheetDt`,
        {
          "Action": "GetReport",
          // "PrintDateTime": "2025-05-06",
          "PrintDateTime": currentDate,
          "Destination": station,
          "FlightNo": flight,
        }
      );
      // console.log("table data", response?.data);
      const tablereport = Array.isArray(response?.data) ? response?.data : [];
      setTableData(tablereport);
      setFilterData(tablereport);
      // console.log("table data",tablereport);
      setIsVisible(null);

        const response1 = await axios.post(`${Environment.BaseAPIURL}/GetPrintLoadSheetDt`,{action: "GetDestinations",});
        // console.log("station drop down", response?.data);
        const arrayData = Array.isArray(response1?.data) ? response1?.data : [];
        setStationData(arrayData);
        // console.log("sta", stationData);
        setLoading(false);
    } catch (error) {
      console.log("error in fetching report table data", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // to get table data on submitting
  const handleSubmit = (e) => {
    e.preventDefault();

    const today = startDate
      ? `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(startDate.getDate()).padStart(2, "0")}`
      : "";

    setDateData(today);
    fetchData(today, selectedStation || "", selectedFlight || "");
  };

  const handleDetails = (details,index) => {
    if(isVisible === index){
      setIsVisible(null);
      setDetailData([]);
      setSecondTableData([]);
    }
    else {
      console.log("data",details)
      setIsVisible(index);
      setDetailData(details);
      setSecondTableData(details);
    }
  }
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

  const [searcTerm2,setSearchTerm2] = useState("");
  const handleSearch2 = (e) => {
    const search = e.target.value;
    setSearchTerm2(search);
    if(search !== ""){
      filterDataFunction(search)
    } else{
      setDetailData(secondTableData);
    }
  }

  const filterDataFunction = (search) => {
    const filtered = secondTableData.filter((data) => Object.values(data).some((value)=> String(value).toLowerCase().includes(search.toLowerCase())))
    setDetailData(filtered);
  }

  // export table data into excel functionality
  const exportToExcel = () => {
    const excelData = tableData.slice();
    const excel = excelData.map((item, index) => ({
      "Sr. no.": index + 1,
      "Date": dateData,
      "Flight No": item.flightNo,
      "Sector": item.destination,
      "LoadSheet Name": item.loadsheetname,
      "Prints count": item.printCount,
    }));

    // Convert JSON to sheet
    const worksheet = XLSX.utils.json_to_sheet(excel, { origin: "A2" }); // Start at A2 to leave space for header
    // Add custom title row
    XLSX.utils.sheet_add_aoa(worksheet, [["Load Sheet Report"]], {
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
    saveAs(blob, "Load Sheet Report.xlsx");
  };

  const exportToExcel2 = () => {
    const excelData = detailData.slice();
    const excel = excelData.map((item, index) => ({
      "Sr. no.": index + 1,
      "Date": dateData,
      "Flight No": item.flightNo,
      "Sector": item.destination,
      "LoadSheet Name": item.loadsheetname,
      "LoadSheet Recieve Date/Time": formatTimestamp(item.loadsheetrecievedDatetime),
      "LoadSheet Print Date/Time": formatTimestamp(item.printDateTime),
      "Printer Mac Address/ID": item.printMacAddress,
      "UserId": item.userId,
    }));

    // Convert JSON to sheet
    const worksheet = XLSX.utils.json_to_sheet(excel, { origin: "A2" }); // Start at A2 to leave space for header
    // Add custom title row
    XLSX.utils.sheet_add_aoa(worksheet, [["Load Sheet Detailed Report"]], {
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
    saveAs(blob, "Load Sheet Detailed Report.xlsx");
  };

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

  return (
    <>
      {loading && <Spinner />}
      <div>
        <Navbar />
        <div className="report-top-container">
          <div className="report-container">
            <form className="report-container-part-1" onSubmit={handleSubmit}>
              <div className="report-datepicker-container start-date-dropdown">
                <label htmlFor="start-date" className="report-label">
                  Start Date
                </label>
                <span className="calender">
                  {/* <FaCalendarAlt /> */}
                  <FontAwesomeIcon icon={faCalendarDays} />
                </span>
                <div className="react-datepicker-wrapper">
                  <DatePicker
                  id="start-date"
                  selected={startDate}
                  onChange={handleStartDateChange}
                  selectsStart
                  placeholderText="Select start date and time"
                  dateFormat="dd-MM-yyyy"
                  className="datepick"
                  maxDate={new Date()}
                /></div>
              </div>

              <div className="report-datepicker-container">
                <label htmlFor="station-select" className="report-label">
                  Select Station
                </label>
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
                <label htmlFor="flight-select" className="report-label">
                  Select Flight
                </label>
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
              <div className="download-excel" onClick={exportToExcel}>
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
          </div>
          <div className="table-scroll-vertical">
            <table>
              <thead>
                <tr>
                  <th>Sr. no</th>
                  <th>Date</th>
                  <th>Flight No.</th>
                  <th>Sector</th>
                  <th>LoadSheet Name</th>
                  <th>Prints Count</th>
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
                    <td style={{fontWeight:"bold",color:"blue",cursor:"pointer"}} onClick={(e) => {handleDetails(item.details,index)}}>{item.printCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {isVisible !== null && <div>
            <div className="report-container-part-2">
              <div className="report-search-button">
                <span className="search-icon">
                  {/* <IoSearchSharp /> */}
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </span>
                <input
                  type="text"
                  placeholder="Search"
                  onChange={handleSearch2}
                  className="report-search-input"
                />
              </div>
              <div className="download-excel" onClick={exportToExcel2}>
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
            <div className="table-scroll-vertical" style={{marginTop:"1rem"}}>
            <table>
              <thead>
                <tr>
                  <th>Sr. no</th>
                  {/* <th>Date</th> */}
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
                {detailData.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.flightNo}</td>
                    <td>{item.destination}</td>
                    <td>{item.loadsheetname}</td>
                    <td>{formatTimestamp(item.loadsheetrecievedDatetime)}</td>
                    <td>{formatTimestamp(item.printDateTime)}</td>
                    <td>{item.printMacAddress}</td>
                    <td>{item.userId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div></div>}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Report;
