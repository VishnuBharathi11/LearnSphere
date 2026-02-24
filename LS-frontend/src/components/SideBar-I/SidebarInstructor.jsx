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
  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleLogout = () => {
    window.appStore.removeItem("currentUser");
    window.appStore.removeItem("isLoggedIn");
    window.appStore.removeItem("authToken");
  };

  return (
    <nav className="I-navbar">
      <div className="logo-name">
        <img src={logo} className="logo" alt="LearnSphere" />
        <div className="page-name">LearnSphere</div>
      </div>

      <div className="I-sidebar">
        <Link
          to="/instructor-layout/dashboard"
          className={isActive("/instructor-layout/dashboard") ? "active" : ""}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        <Link
          to="/instructor-layout/create-course"
          className={isActive("/instructor-layout/create-course") ? "active" : ""}
        >
          <PlusSquare size={18} />
          Create Course
        </Link>

        <Link
          to="/instructor-layout/manage-courses"
          className={isActive("/instructor-layout/manage-courses") ? "active" : ""}
        >
          <FolderKanban size={18} />
          Manage Courses
        </Link>

        <Link
          to="/instructor-layout/discussions"
          className={isActive("/instructor-layout/discussions") ? "active" : ""}
        >
          <MessageSquare size={18} />
          Discussions
        </Link>

        <Link
          to="/instructor-layout/profile"
          className={isActive("/instructor-layout/profile") ? "active" : ""}
        >
          <User size={18} />
          My Profile
        </Link>

        <Link to="/login" className="logout" onClick={handleLogout}>
          <LogOut size={20} />
          Logout
        </Link>
      </div>
    </nav>
  );
}

export default SidebarInstructor;
