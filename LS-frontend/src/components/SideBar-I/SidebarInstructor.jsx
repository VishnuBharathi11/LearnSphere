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
  const isDiscussionActive =
    location.pathname.startsWith("/instructor-layout/forum") ||
    location.pathname.startsWith("/instructor-layout/forum/topic/") ||
    (location.pathname.startsWith("/courses/") && location.pathname.endsWith("/forum")) ||
    location.pathname.startsWith("/forum/topic/") ||
    location.pathname.startsWith("/instructor-layout/discussions");

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
          to="/instructor-layout/forum"
          className={isDiscussionActive ? "active" : ""}
        >
          <MessageSquare size={18} />
          Discussion
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
