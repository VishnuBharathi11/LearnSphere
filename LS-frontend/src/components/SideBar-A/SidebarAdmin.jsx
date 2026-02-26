import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CheckCircle,
  Layers,
  UserCog,
  Settings,
  LogOut,
} from "lucide-react";
import logo from "../../assets/Logo/logo.png";
import "./SidebarAdmin.scss";

function SidebarAdmin() {
  const location = useLocation();

  const isActive = (path) => (location.pathname === path ? "active" : "");

  return (
    <nav className="admin-navbar">
      <div className="admin-logo">
        <img src={logo} alt="LearnSphere" />
        <span>LearnSphere</span>
      </div>

      <div className="admin-menu">

        <Link
          to="/admin-layout/dashboard"
          className={isActive("/admin-layout/dashboard")}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        <Link
          to="/admin-layout/users"
          className={isActive("/admin-layout/users")}
        >
          <Users size={18} />
          Manage Users
        </Link>

        <Link
          to="/admin-layout/courses"
          className={isActive("/admin-layout/courses")}
        >
          <BookOpen size={18} />
          Manage Courses
        </Link>

        <Link
          to="/admin-layout/approve-courses"
          className={isActive("/admin-layout/approve-courses")}
        >
          <CheckCircle size={18} />
          Approve Courses
        </Link>

        <Link
          to="/admin-layout/categories"
          className={isActive("/admin-layout/categories")}
        >
          <Layers size={18} />
          Categories
        </Link>

        <Link
          to="/admin-layout/roles"
          className={isActive("/admin-layout/roles")}
        >
          <UserCog size={18} />
          Role Management
        </Link>

        <Link
          to="/admin-layout/settings"
          className={isActive("/admin-layout/settings")}
        >
          <Settings size={18} />
          Settings
        </Link>

        <Link
          to="/login"
          className="nav-item-logout"
        >
          <LogOut size={18} />
          Logout
        </Link>
      
      </div>
    </nav>
  );
}

export default SidebarAdmin;
