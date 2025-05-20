import React, { lazy, Suspense } from 'react'
import "./Dashboard.css"
import "../component/Footer.css"
import "../component/Navbar.css"
import "../component/Spinner.css"

import { MdFlight } from "react-icons/md"
import { RiPrinterFill } from "react-icons/ri"
import { TbMessageReportFilled } from "react-icons/tb"
import Spinner from '../component/Spinner'
const Cards = lazy(() => import('../component/Cards'))
const Navbar = lazy(() => import('../component/Navbar'))
const Footer = lazy(() => import('../component/Footer'))
// const Spinner = lazy(()=> import('../component/Spinner'))


function Dashboard() {
  return (
   <div className='cont'>
  <Suspense fallback={<Spinner/>}>
    <Navbar />
  <div className='dashboard-component'>
    {/* <Suspense fallback={<Spinner/>}> */}
      <Cards heading="Total Active Stations" bgColor="#FFBE5D" icon={<MdFlight />} count="55"/>
      <Cards heading="Total Active Printers" bgColor="#6C81F5" icon={<RiPrinterFill />} count="200"/>
      <Cards heading="Total No. of Loadsheet Received" bgColor="#15DB67" icon={<TbMessageReportFilled />} count="2500"/>
      <Cards heading="Total No. of Loadsheet Printed" bgColor="#F97775" icon={<TbMessageReportFilled />} count="2000"/>
    {/* </Suspense> */}
  </div>

  {/* <Suspense fallback={<Spinner/>}> */}
    <Footer />
  </Suspense>
</div>

  )
}

export default Dashboard