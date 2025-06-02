import {lazy,Suspense} from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import ProtectedRoutes from './component/ProtectedRoutes';
import "../src/pages/Login.css";
import "../src/pages/AddRole.css";
import "../src/pages/AddUser.css";
import "../src/pages/Dashboard.css";
import "../src/pages/Report.css";
import "../src/pages/AuditReport.css";
import "../src/pages/AddVendor.css";
import "../src/pages/Welcome.css"
import "../src/pages/ImageReport.css"
import Spinner from './component/Spinner';
import AutoLogout from './hooks/AutoLogout';
const Login = lazy(()=>import ('./pages/Login'));
const Dashboard = lazy(()=>import ('./pages/Dashboard'));
const Report = lazy(()=>import ('./pages/Report'));
const AddUser = lazy(()=>import ('./pages/AddUser'));
const AddRole = lazy(()=>import ('./pages/AddRole'));
const AuditReport = lazy(()=> import ('./pages/AuditReport'))
const Welcome = lazy(()=> import('./pages/Welcome'))
const AddVendor = lazy(()=> import('./pages/AddVendor'));
const ImageReport = lazy(()=> import('./pages/ImageReport'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <BrowserRouter>
        <AutoLogout />  
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/Dashboard" element={<ProtectedRoutes><Dashboard /></ProtectedRoutes>} />
          {/* <Route path="/Add-User" element={<AddUser />} /> */}
          <Route path="/Add-User" element={<ProtectedRoutes><AddUser /></ProtectedRoutes>} />
          {/* <Route path="/Add-Role" element={<AddRole />} /> */}
          <Route path="/Add-Role" element={<ProtectedRoutes><AddRole /></ProtectedRoutes>} />
          <Route path="/LoadSheetReport" element={<ProtectedRoutes><Report /></ProtectedRoutes>} />
          <Route path="/AuditReport" element={<ProtectedRoutes><AuditReport /></ProtectedRoutes>} />
          <Route path="/Welcome" element={<ProtectedRoutes><Welcome/></ProtectedRoutes>} />
          <Route path="/Add-Vendor" element={<ProtectedRoutes><AddVendor/></ProtectedRoutes>}/>
          <Route path="/ImageReport" element={<ImageReport/>}/>
        </Routes>
      </BrowserRouter>
    </Suspense>
  );
}


export default App;
