import React, { lazy, Suspense } from 'react';
import "./Dashboard.css";
import "../component/Footer.css";
import "../component/Navbar.css";
import "../component/Spinner.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlaneDeparture, faPrint, faMoneyBill1 } from '@fortawesome/free-solid-svg-icons';
import Spinner from '../component/Spinner';

const Cards = lazy(() => import('../component/Cards'));
const Navbar = lazy(() => import('../component/Navbar'));
const Footer = lazy(() => import('../component/Footer'));

function Dashboard() {
  return (
    <Suspense fallback={<Spinner />}>
      <div className="dashboard-wrapper">
        <Navbar />
        <div className='heading'><div>Dashboard </div> <hr /> </div>
        <div className='cont'>
        <div className='dashboard-component'>
          <Cards heading="Total Active Stations" bgColor="#FFBE5D" icon={<FontAwesomeIcon icon={faPlaneDeparture} />} count="55" />
          <Cards heading="Total Active Printers" bgColor="#6C81F5" icon={<FontAwesomeIcon icon={faPrint} />} count="200" />
          <Cards heading="Total No. of Loadsheet Received" bgColor="#15DB67" icon={<FontAwesomeIcon icon={faMoneyBill1} />} count="2500" />
          <Cards heading="Total No. of Loadsheet Printed" bgColor="#F97775" icon={<FontAwesomeIcon icon={faMoneyBill1} />} count="2000" />
        </div>
        </div>
        <Footer />
      </div>
    </Suspense>
  );
}

export default Dashboard;
