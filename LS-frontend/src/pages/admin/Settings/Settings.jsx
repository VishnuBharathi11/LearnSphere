import React, { useState } from "react";
import SidebarAdmin from "../../../components/SideBar-A/SidebarAdmin";
import "./Settings.scss";

function Settings(){
  const [settings, setSettings] = useState({
    siteName: "LearnSphere",
    siteEmail: "admin@learnsphere.com",
    supportEmail: "support@learnsphere.com",
    platformFee: 15,
    minPrice: 299,
    maxPrice: 9999,
    toggles: {
      userRegistration: true,
      emailVerification: true,
      courseReviews: true,
      discussions: true,
      autoApproveInstructors: false,
      autoApproveCourses: false,
      guestBrowsing: true,
      maintenanceMode: false,
    },
  });

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      toggles: {
        ...prev.toggles,
        [key]: !prev.toggles[key],
      },
    }));
  };

  return (
    <div className="settings-layout">
        <SidebarAdmin/>
    <div className="settings-wrapper">
      <h1 className="page-title">System Settings</h1>
      <p className="page-subtitle">Configure platform-wide settings</p>
      <div className="settings-card">
        <h3 className="card-title">🛡️ General Settings</h3>

        <div className="form-grid">
          <div className="form-group">
            <label>Site Name</label>
            <input value={settings.siteName} />
          </div>

          <div className="form-group">
            <label>Site Email</label>
            <input value={settings.siteEmail} />
          </div>

          <div className="form-group full">
            <label>Support Email</label>
            <input value={settings.supportEmail} />
          </div>
        </div>
      </div>

      {/* Payment Settings */}
      <div className="settings-card">
        <h3 className="card-title">💲 Payment Settings</h3>

        <div className="form-grid">
          <div className="form-group">
            <label>Platform Fee (%)</label>
            <input value={settings.platformFee} />
          </div>

          <div className="form-group">
            <label>Min Course Price (₹)</label>
            <input value={settings.minPrice} />
          </div>

          <div className="form-group">
            <label>Max Course Price (₹)</label>
            <input value={settings.maxPrice} />
          </div>
        </div>
      </div>

      {/* Featured Settings */}
      <div className="settings-card">
        <h3 className="card-title">⭐ Featured Settings</h3>

        {[
          ["Enable User Registration", "userRegistration"],
          ["Require Email Verification", "emailVerification"],
          ["Enable Course Reviews", "courseReviews"],
          ["Enable Discussions", "discussions"],
          ["Auto-Approve Instructors", "autoApproveInstructors"],
          ["Auto-Approve Courses", "autoApproveCourses"],
          ["Allow Guest Browsing", "guestBrowsing"],
          ["Maintenance Mode", "maintenanceMode"],
        ].map(([label, key]) => (
          <div className="toggle-row" key={key}>
            <span>{label}</span>
            <div
              className={`toggle ${settings.toggles[key] ? "on" : ""}`}
              onClick={() => handleToggle(key)}
            >
              <div className="toggle-thumb" />
            </div>
          </div>
        ))}
      </div>

      <button className="save-btn">💾 Save Settings</button>
    </div>
    </div>
  );
};

export default Settings;
