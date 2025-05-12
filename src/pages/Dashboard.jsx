import React from 'react'
import "./Dashboard.css"
import Navbar from '../component/Navbar'
import Footer from '../component/Footer'
import Cards from '../component/Cards'
import { MdFlight } from "react-icons/md";
import { RiPrinterFill } from "react-icons/ri";
import { TbMessageReportFilled } from "react-icons/tb";

function Dashboard() {
  return (
    <div className='cont'>
      <Navbar/>
      <div className='dashboard-component'>
      <Cards heading="Total Active Stations" bgColor="#FFBE5D" icon={<MdFlight />} count="55"/>
      <Cards heading="Total Active Printers" bgColor="#6C81F5" icon={<RiPrinterFill />} count="200"/>
      <Cards heading="Total No. of Loadsheet Received" bgColor="#15DB67" icon={<TbMessageReportFilled />} count="2500"/>
      <Cards heading="Total No. of Loadsheet Printed" bgColor="#F97775" icon={<TbMessageReportFilled />} count="2000"/>
      </div>
    <Footer/>
    </div>
  )
}

export default Dashboard