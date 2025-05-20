import React, { useRef, useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Report.css";
import { FaCalendarAlt } from "react-icons/fa";
import { IoSearchSharp } from "react-icons/io5";
// import { RiFileExcel2Line } from "react-icons/ri";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import data from "../Data/Data";
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

  // api to get station drop down data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
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
        setLoading(false);
      } catch (error) {
        console.log("error in fetching stations", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
          Action: "GetReport",
          printDateTime: currentDate,
          Destination: station,
          FlightNo: flight,
        }
      );
      console.log("table data", response?.data);
      const tablereport = Array.isArray(response?.data) ? response?.data : [];
      setTableData(tablereport);
      setFilterData(tablereport);
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

  // const [pageSize, setPageSize] = useState(10);
  // const tableRef = useRef();

  // it is used to searching in table
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

  // export table data into excel functionality
  const exportToExcel = () => {
    const excelData = tableData.slice();
    const excel = excelData.map((item, index) => ({
      "Sr. no.": index + 1,
      Date: dateData,
      "Flight No": item.flightNo,
      Sector: item.destination,
      "LoadSheet Name": item.loadsheetname,
      "LoadSheet Recieve Date/Time": item.loadsheetrecievedDatetime,
      "LoadSheet Print Date/Time": item.printDateTime,
      "Printer Mac Address/ID": item.printMacAddress,
      UserId: item.userId,
      // "Prints count": item["No-of-Prints"],
    }));

    // Convert JSON to sheet
    const worksheet = XLSX.utils.json_to_sheet(excel, { origin: "A2" }); // Start at A2 to leave space for header
    // Add custom title row
    XLSX.utils.sheet_add_aoa(worksheet, [["Load Sheet Details"]], {
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
                  <FaCalendarAlt />
                </span>
                <div className="react-datepicker-wrapper"><DatePicker
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
                  <IoSearchSharp />
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
                    <td>{formatTimestamp(item.loadsheetrecievedDatetime)}</td>
                    {/* <td>{item.loadsheetrecievedDatetime}</td> */}
                    <td>{formatTimestamp(item.printDateTime)}</td>
                    {/* <td>{item.printDateTime}</td> */}
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
