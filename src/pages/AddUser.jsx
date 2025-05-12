import React, { useEffect, useState } from "react";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import "./AddUser.css";
import { FaUser } from "react-icons/fa";
import { MdMarkEmailUnread } from "react-icons/md";
import { MdOutlineLocalAirport } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import { IoSearchSharp } from "react-icons/io5";
import users from "../Data/UserData";
import { FaEdit } from "react-icons/fa";
import Switch from "react-switch";
import axios from "axios";
import Environment from "../Environment";
import { ToastContainer, toast ,Bounce} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Spinner from "../component/Spinner";

const AddUser = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [station, setStation] = useState("");
  const [stationData, setStationData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [filterData,setFilterData] = useState([]);
  const [status, setStatus] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [userData1, setUserData1] = useState([]);
  const [emailError, setEmailError] = useState("");
  const [loading,setLoading] = useState(false);

  useEffect(()=>{
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.post(`${Environment.BaseAPIURL}/GetAddUserReport`,{
          "action": "GetReportUser"
        });
        console.log("userData",response?.data);
        const userData = Array.isArray(response?.data) ? response?.data : [];
        setTableData(userData)
        setFilterData(userData)
        setUserData1(userData);
        setLoading(false);
      } catch (error) {
        console.log("error in fetching data",error);
        setLoading(false);
      }
    }
    fetchData();
  },[])

  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.post(
          `${Environment.BaseAPIURL}/GetDestDropdownbind`,
          {
            action: "GetActiveDestinations",
          }
        );
        console.log("station drop down", response?.data);
        const arrayData = Array.isArray(response?.data)
          ? response?.data
          : [];
        setStationData(arrayData);
        setLoading(false);
      } catch (error) {
        console.log("error in fetching stations", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const handleNameChange = (e) => {
    setName(e.target.value);
    if(e.target.value !== ''){
      setEmptyFields(prev => ({...prev,name:false}));
    }
  };
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError('');
    if(e.target.value !== ''){
      setEmptyFields(prev => ({...prev,email:false}));
    }
    if(e.target.value !== '' && checkDuplicateEmail(e.target.value)){
      setEmailError('*Email Already Exists')
    }
  };
  const handleMobileChange = (e) => {
    setMobile(e.target.value);
    // if(e.target.value !== ''){
    //   setEmptyFields(prev => ({...prev,mobile:false}));
    // }
  };
  const handleStationChange = (e) => {
    setStation(e.target.value);
    if(e.target.value !== '')
    {
      setEmptyFields(prev => ({...prev, station:false}));
    }
  };

  const [emptyFields,setEmptyFields] = useState({
    name:false,
    email:false,
    station:false
  })

  const handleReset = () => {
    setName('');
    setEmail('');
    setMobile('');
    setStation('');
    setEmptyFields({
      name:false,
      email:false,
      station:false
    })
    setEditingIndex(null);
  }

   // to check the duplicate email
  const checkDuplicateEmail = (email) => {
    return userData1.some( user => String(user.userId).toLowerCase() === email.toLowerCase())
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emptyFieldsCopy = {...emptyFields};
    let hasEmptyFiled = false
    const payload = {
      name,
      email,
      mobile,
      station,
    };
    if(!name){
      emptyFieldsCopy.name = true;
      hasEmptyFiled = true
    }else{
      emptyFieldsCopy.name = false;
    }
    if(!email){
      emptyFieldsCopy.email = true;
      hasEmptyFiled = true;
    }
    else {
      emptyFieldsCopy.email = false
    }
    if(!station){
      emptyFieldsCopy.station = true;
      hasEmptyFiled = true
    }
    else {
      emptyFieldsCopy.station = false;
    }
    setEmptyFields(emptyFieldsCopy);
    if(hasEmptyFiled){
      return;
    }
    let userEmail = false
    if(editingIndex === null)
    {
      if(checkDuplicateEmail(email)){
        setEmailError("*Email already Exist");
        userEmail = true;
      }
      else {
        setEmailError("");
      }
    }
    if(userEmail)
    {
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${Environment.BaseAPIURL}/SaveUserandUpdate`,{
      "action": editingIndex !== null ? "UpdateUser":"InsertUser",
      "userId": email,
      "stationCode": station,
      "name": name,
      "contactNo": mobile,
      "isActive": status
      })
      // console.log(response.data.isSuccess,123)
      if(response.data.isSuccess){
        const updateUserTable = await axios.post(`${Environment.BaseAPIURL}/GetAddUserReport`,{
          "action": "GetReportUser"
        });
        const userDataupdated = Array.isArray(updateUserTable?.data) ? updateUserTable?.data : [];
        setTableData(userDataupdated)
        setFilterData(userDataupdated)
        setUserData1(userDataupdated);
        if(editingIndex === null){
          toast.success("User added successfully",{
          autoClose:2000
        })
        }else {
          toast.success("User updated successfully",{
          autoClose:2000
        })
        }
      }
      else{
        // alert("failed to add-update the user");
        toast.error("Failed to add or update the user")
      }
    } catch (error) {
      console.log("error in adding updating the user",error);
    }
    setLoading(false)
    console.log("submitted data", payload);
    handleReset();
  };

  const handleEdit = (index) => {
    const editedUser = tableData[index];
    console.log("edited data",editedUser);
    if(editedUser){
      setName(editedUser.name);
      setEmail(editedUser.userId);
      setMobile(editedUser.contactNo);
      setStation(editedUser.stationCode);
      setStatus(editedUser.isActive);
      setEditingIndex(index);
      setEmptyFields({
        name:false,
        email:false,
        station:false
      })
    }
    else {
      console.log("Edited User does not found")
    }
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  return (
<>
{loading && <Spinner/>}
    <div className="main-container-user">
      <Navbar />
      <div className="User-container">
        <div className="user-uper">
          <form className="user-form" onSubmit={handleSubmit}>
            <div className="user-form-upper-part">
              <div className="boxes">
                <span>
                  <FaUser />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="Enter Name"
                  className={`user-input ${emptyFields.name ? 'error-border' : ''}`}
                />
                {emptyFields.name && <div className="error-message">*Name is required</div>}
              </div>
              <div className="boxes">
                <span>
                  <MdMarkEmailUnread />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter Email"
                  className={`user-input ${emptyFields.email ? 'error-border' : ''}`}
                  disabled = {editingIndex !== null}
                />
                {emptyFields.email && <div className="error-message">*Email is required</div>}
                {emailError && <p className="error-message">{emailError}</p>}
              </div>
              <div className="boxes">
                <span>
                  <MdOutlineLocalAirport />
                </span>
                <select
                  value={station}
                  onChange={handleStationChange}
                  className={`user-input ${emptyFields.station ? 'error-border' : ''}`}
                >
                  <option value="" disabled>Select Station</option>
                  {stationData.map((station, index) => (
                    <option key={index} value={station.destination}>
                      {station.destination}
                    </option>
                  ))}
                </select>
                {emptyFields.station && <div className="error-message"> *Station is required</div>}
              </div>
              <div className="boxes">
                <span>
                  <FaPhoneAlt />
                </span>
                <input
                  type="tel"
                  // className={`user-input ${emptyFields.mobile ? 'error-border' : ''}`}
                  className="user-input"
                  placeholder="Enter phone number"
                  maxLength="10"
                  value={mobile}
                  onChange={handleMobileChange}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, "");
                  }}
                />
                {/* {emptyFields.mobile && <div className="error-message">*Mobile is required</div>} */}
              </div>
            </div>
            <div className="user-form-lower-part">
                        {/* // Switch toggle button */}
                        <Switch
                checked={status === 1}
                onChange={() =>
                  setStatus(status === 1 ? 0 : 1)
                }
              />
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
          </form>
          <div className="user-container-part-2">
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
            {/* <div className="download-excel" onClick={exportToExcel}>
                                 <RiFileExcel2Line className="excel-icon" /> Export As
                               </div> */}
          </div>
        </div>
        <div className="table-scroll-verticall">
          <table className="table">
            <thead>
              <tr>
                <th>Sr. no</th>
                <th>Name</th>
                <th>Email ID</th>
                <th>Station</th>
                <th>Phone Number</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((data, index) => (
                <tr>
                  <td>{index + 1}</td>
                  <td>{data.name}</td>
                  <td>{data.userId}</td>
                  <td>{data.stationCode}</td>
                  <td>{data.contactNo}</td>
                  <td>{String(data.isActive) === "1" ? "Active" : "Inactive"}</td>
                  <td style={{ cursor: "pointer" }} onClick={() => handleEdit(index)}>
                    <FaEdit />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
      <ToastContainer
position="top-right"
autoClose={5000}
hideProgressBar={false}
newestOnTop={false}
closeOnClick={false}
rtl={false}
pauseOnFocusLoss
draggable
pauseOnHover
theme="light"
transition={Bounce}
/>
    </div>
    </>
  );
};

export default AddUser;
