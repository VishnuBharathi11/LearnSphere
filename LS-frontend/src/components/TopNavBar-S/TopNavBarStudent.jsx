import React from "react";
import { FiSearch, FiBell } from "react-icons/fi";
import "./TopNavBarStudent.scss";
function TopNavBarStudent({ activeTab }) {
  return (
    <div className="dashboard-header">
      <div className="header-left">
        <h2>{activeTab}</h2>
      </div>

      <div className="header-right">


        <div className="notification">
          <FiBell />
          <span className="badge">2</span>
        </div>

        <div className="profile">
          <div className="avatar">PM</div>
          <div className="profile-info">
            <span className="name">Peter Parker</span>
            <span className="email">peter@gmail.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopNavBarStudent;