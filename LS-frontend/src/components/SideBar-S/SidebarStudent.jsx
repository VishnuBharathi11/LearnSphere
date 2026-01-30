import { NavLink } from "react-router-dom";
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

function SidebarStudent() {
  return (
    <nav className="L-navbar">
      <div className="logo-name">
        <img src={logo} className="logo" alt="logo" />
        <span className="page-name">LearnSphere</span>
      </div>

      <div className="L-sidebar">
        <NavLink to="dashboard" className="nav-item">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="my-courses" className="nav-item">
          <BookOpen size={20} />
          <span>My Courses</span>
        </NavLink>

        <NavLink to="progress" className="nav-item">
          <BarChart3 size={20} />
          <span>Progress</span>
        </NavLink>

        <NavLink to="assessment" className="nav-item">
          <ClipboardList size={20} />
          <span>Assessment</span>
        </NavLink>

        <NavLink to="profile" className="nav-item">
          <User size={20} />
          <span>My Profile</span>
        </NavLink>

        <NavLink to="/login" className="nav-item logout">
          <LogOut size={20} />
          <span>Logout</span>
        </NavLink>
      </div>
    </nav>
  );
}

export default SidebarStudent;
