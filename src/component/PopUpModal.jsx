import React from 'react';
import './PopUpModal.css'; // Import external CSS

function PopUpModal({ onClose , text}) {
  return (
    <div className="popup-container">
      <div className="popup-card">
        <div className="popup-icon">
          <img src="/images/checked.png" alt="Success" />
        </div>
        <div className="popup-title">Success!</div>
        <div className="popup-message">{text}</div>
        <button className="popup-button" onClick={onClose}>OKAY</button>
      </div>
    </div>
  );
}

export default PopUpModal;
