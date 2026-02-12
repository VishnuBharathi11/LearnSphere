import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PlusSquare,
  FolderKanban,
  MessageSquare,
  User,
  LogOut
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
        <Link
          to="/instructor-layout/dashboard"
          className={
            location.pathname === "/instructor-layout/dashboard" ? "active" : ""
          }
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        <Link
          to="/instructor-layout/create-course"
          className={
            location.pathname === "/instructor-layout/create-course"
              ? "active"
              : ""
          }
        >
          <PlusSquare size={18} />
          Create Course
        </Link>

        <Link
          to="/instructor-layout/manage-courses"
          className={
            location.pathname === "/instructor-layout/manage-courses"
              ? "active"
              : ""
          }
        >
          <FolderKanban size={18} />
          Manage Courses
        </Link>

        <Link
          to="/instructor-layout/discussions"
          className={
            location.pathname === "/instructor-layout/discussions"
              ? "active"
              : ""
          }
        >
          <MessageSquare size={18} />
          Discussions
        </Link>

        <Link
          to="/instructor-layout/profile"
          className={
            location.pathname === "/instructor-layout/profile" ? "active" : ""
          }
        >
          <User size={18} />
          My Profile
        </Link>

        <Link to="/login" className="logout">
          <LogOut size={20} />
          Logout
        </Link>
      </div>
    </nav>
  );
}

export default SidebarInstructor;
