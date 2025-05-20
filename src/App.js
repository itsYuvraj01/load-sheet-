import {lazy,Suspense} from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import "../src/pages/Login.css";
import "../src/pages/AddRole.css";
import "../src/pages/AddUser.css";
import "../src/pages/Dashboard.css";
import "../src/pages/Report.css";
import Spinner from './component/Spinner';
const Login = lazy(()=>import ('./pages/Login'));
const Dashboard = lazy(()=>import ('./pages/Dashboard'));
const Report = lazy(()=>import ('./pages/Report'));
const AddUser = lazy(()=>import ('./pages/AddUser'));
const AddRole = lazy(()=>import ('./pages/AddRole'));

// import "../src/pages/Login.css";

// import Dashboard from './pages/Dashboard';
// import Report from './pages/Report';
// import AddUser from './pages/AddUser';
// import Login from './pages/Login';
// import AddRole from './pages/AddRole';

function App() {
  return (
    <Suspense fallback={<Spinner/>}>
    <BrowserRouter>
    <ToastContainer/> 
    <Routes>
      {/* <Route path = "/" element={<Login/>}/> */}
      <Route path = "/" element={<Login/>}/>
      <Route path = "/Dashboard" element={<Dashboard/>}/>
      <Route path = "/Add-User" element = {<AddUser/>}/>
      <Route path = "/Add-Role" element = {<AddRole/>} />
      <Route path = "/LoadSheetReport" element = {<Report/>}/>     
    </Routes>
    </BrowserRouter>
    </Suspense>
  );
}

export default App;
