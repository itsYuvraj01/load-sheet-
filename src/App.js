import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Report from './pages/Report';
import AddUser from './pages/AddUser';
import Login from './pages/Login';
function App() {
  return (
    <BrowserRouter>
    <Routes>
      {/* <Route path = "/" element={<Login/>}/> */}
      <Route path = "/" element={<Login/>}/>
      <Route path = "/Dashboard" element={<Dashboard/>}/>
      <Route path = "/Add-User" element = {<AddUser/>}/>
      <Route path = "/LoadSheetReport" element = {<Report/>}/>     
    </Routes>
    </BrowserRouter>
  );
}

export default App;
