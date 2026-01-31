import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CheckCircle,
  Layers,
  BarChart2,
  ShieldCheck,
  UserCog,
  Settings,
} from "lucide-react";
import logo from "../../assets/Logo/logo.png";
import "./SidebarAdmin.scss";
function SidebarAdmin() {
  const location = useLocation();
  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };
  return (
    <nav className="admin-navbar">
      <div className="admin-logo">
        <img src={logo} alt="LearnSphere" />
        <span>LearnSphere</span>
      </div>
      <div className="admin-menu">
        <Link to="/admin-dashboard" className={isActive("/admin-dashboard")}>
          <LayoutDashboard size={18} />
          Dashboard
        </Link>
        <Link to="/manage-users" className={isActive("/manage-users")}>
          <Users size={18} />
          Manage Users
        </Link>
        <Link to="/handle-courses" className={isActive("/handle-courses")}>
          <BookOpen size={18} />
          Manage Courses
        </Link>
        <Link
          to="/approve-courses"
          className={isActive("/approve-courses")}
        >
          <CheckCircle size={18} />
          Approve Courses
        </Link>
        <Link to="/categories" className={isActive("/categories")}>
          <Layers size={18} />
          Categories{" "}
        </Link>
        <Link to="/roles" className={isActive("/roles")}>
          <UserCog size={18} />
          Role Management
        </Link>
        <Link to="/settings" className={isActive("/settings")}>
          <Settings size={18} />
          Settings
        </Link>
      </div>
    </nav>
  );
}

export default SidebarAdmin;
