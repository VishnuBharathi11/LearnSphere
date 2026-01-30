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
import "./SidebarInstructor.scss";

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
        <Link to="/create-course" className={location.pathname === "/create-course" ? "active" : ""}><PlusSquare size={18}/>Create Course</Link>
        <Link to="/manage-courses" className={location.pathname === "/manage-courses" ? "active" : ""}><FolderKanban size={18}/>Manage Courses</Link>
        <Link to="/discussions" className={location.pathname === "/discussions" ? "active" : ""}><MessageSquare size={18}/>Discussions</Link>
        <Link to="/profile" className={location.pathname === "/profile" ? "active" : ""}><User size={18}/>My Profile</Link>
      </div>
    </nav>
  );
}

export default SidebarInstructor;
