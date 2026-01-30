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

          <div
            className={`nav-item ${activeTab === "Dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("Dashboard")}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </div>

          <div
            className={`nav-item ${activeTab === "My Courses" ? "active" : ""}`}
            onClick={() => setActiveTab("My Courses")}
          >
            <BookOpen size={20} />
            <span>My Courses</span>
          </div>

          <div
            className={`nav-item ${activeTab === "Progress" ? "active" : ""}`}
            onClick={() => setActiveTab("Progress")}
          >
            <BarChart3 size={20} />
            <span>Progress</span>
          </div>

          <div
            className={`nav-item ${activeTab === "Assessment" ? "active" : ""}`}
            onClick={() => setActiveTab("Assessment")}
          >
            <ClipboardList size={20} />
            <span>Assessment</span>
          </div>

          <div
            className={`nav-item ${activeTab === "Profile" ? "active" : ""}`}
            onClick={() => setActiveTab("Profile")}
          >
            <User size={20} />
            <span>My Profile</span>
          </div>

          <div className="nav-item logout">
            <LogOut size={20} />
            <div onClick={()=>navigate("/login")}>Logout</div>
          </div>

        </div>
      </nav>

      <div className="main-section">{children}</div>
    </div>
  );
}

export default SidebarStudent;