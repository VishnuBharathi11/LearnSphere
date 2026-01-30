import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  ClipboardList,
  User,
  LogOut,
} from "lucide-react";

import logo from "../../assets/Logo/logo.png";
import "./SidebarStudent.scss";

function SidebarStudent({ activeTab, setActiveTab, children }) {
  const navigate = useNavigate();

  return (
    <div className="student-layout">
      <nav className="L-navbar">
        <div className="logo-name">
          <img src={logo} className="logo" alt="logo" />
          <span className="page-name">LearnSphere</span>
        </div>

        <div className="L-sidebar">

          {/* DASHBOARD */}
          <div
            className={`nav-item ${activeTab === "Dashboard" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("Dashboard");
              navigate("/student-layout");
            }}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </div>

          {/* MY COURSES */}
          <div
            className={`nav-item ${activeTab === "My Courses" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("My Courses");
              navigate("/student-layout");
            }}
          >
            <BookOpen size={20} />
            <span>My Courses</span>
          </div>

          {/* PROGRESS */}
          <div
            className={`nav-item ${activeTab === "Progress" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("Progress");
              navigate("/student-layout");
            }}
          >
            <BarChart3 size={20} />
            <span>Progress</span>
          </div>

          {/* ASSESSMENT */}
          <div
            className={`nav-item ${activeTab === "Assessment" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("Assessment");
              navigate("/student-layout");
            }}
          >
            <ClipboardList size={20} />
            <span>Assessment</span>
          </div>

          {/* PROFILE */}
          <div
            className={`nav-item ${activeTab === "Profile" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("Profile");
              navigate("/student-layout");
            }}
          >
            <User size={20} />
            <span>My Profile</span>
          </div>

          <div className="nav-item logout">
            <LogOut size={20} />
            <div onClick={() => navigate("/login")}>Logout</div>
          </div>

        </div>
      </nav>

      <div className="main-section">{children}</div>
    </div>
  );
}

export default SidebarStudent;