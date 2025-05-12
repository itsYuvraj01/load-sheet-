import React from 'react';
import './Spinner.css'; // CSS file for spinner styling

const Spinner = () => {
  return (
    <div className="spinner-overlay">
      <div className="spinner" />
    </div>
  );
};

export default Spinner;
