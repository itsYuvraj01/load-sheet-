import React from 'react'
import './Welcome.css'
import Navbar from '../component/Navbar'
import Footer from '../component/Footer'

const Welcome = () => {
  return (
    <div className='welcome-page'>
      <Navbar/>
      <div className='welcome-box'>
        Welcome to AIX Load Sheet Application
      </div>
      <Footer/>
    </div>
  )
}

export default Welcome