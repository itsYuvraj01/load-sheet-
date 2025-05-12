import React from 'react'
import "./Footer.css"

const Cards = ({heading,bgColor,icon,count}) => {
  return (
    <div className='Card-container' style={{ backgroundColor: bgColor }}>
        <div className='card-heading'>{heading}</div>
        <div className='icon-parent'>
           {icon && <div className='icons'>{icon}</div>}
            <div className='card-count'>{count}</div>
        </div>
    </div>
  )
}

export default Cards