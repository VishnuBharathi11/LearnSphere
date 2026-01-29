import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PlusSquare,
  FolderKanban,
  MessageSquare,
  User
} from "lucide-react";
import logo from "../../assets/Logo/logo.png";
import "./SidebarInstructor.css";

function SidebarInstructor() {
  const location = useLocation();
  return (
    <nav className="I-navbar">
      <div className="logo-name">
        <img src={logo} className="logo" alt="LearnSphere" />
        <div className="page-name">LearnSphere</div>
      </div>
      <div className="I-sidebar">
        <Link to="/instructor-dashboard" className={location.pathname === "/instructor-dashboard" ? "active" : ""}><LayoutDashboard size={18}/>Dashboard</Link>
        <Link to="/instructor-create-course" className={location.pathname === "/instructor-create-course" ? "active" : ""}><PlusSquare size={18}/>Create Course</Link>
        <Link to="/instructor-manage-courses" className={location.pathname === "/instructor-manage-courses" ? "active" : ""}><FolderKanban size={18}/>Manage Courses</Link>
        <Link to="/instructor-discussions" className={location.pathname === "/instructor-discussions" ? "active" : ""}><MessageSquare size={18}/>Discussions</Link>
        <Link to="/instructor-profile" className={location.pathname === "/instructor-profile" ? "active" : ""}><User size={18}/>My Profile</Link>
      </div>
    </nav>
  );
}

export default SidebarInstructor;
