import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  BarChart3,
  ClipboardList,
  User,
  LogOut,
} from "lucide-react";

import logo from "../../assets/Logo/logo.png";
import "./SidebarStudent.scss";

function SidebarStudent() {
  const location = useLocation();
  const isDiscussionActive =
    location.pathname.startsWith("/student-layout/forum") ||
    (location.pathname.startsWith("/courses/") &&
      location.pathname.endsWith("/forum")) ||
    location.pathname.startsWith("/forum/topic/");

  return (
    <nav className="L-navbar">
      <div className="logo-name">
        <img src={logo} className="logo" alt="logo" />
        <span className="page-name">LearnSphere</span>
      </div>

      <div className="L-sidebar">
        <NavLink to="/student-layout/dashboard" className="nav-item">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/student-layout/my-courses" className="nav-item">
          <BookOpen size={20} />
          <span>My Courses</span>
        </NavLink>

        <NavLink
          to="/courses/general/forum"
          className={({ isActive }) =>
            isActive || isDiscussionActive ? "nav-item active" : "nav-item"
          }
        >
          <MessageSquare size={20} />
          <span>Discussion</span>
        </NavLink>

        <NavLink to="/student-layout/progress" className="nav-item">
          <BarChart3 size={20} />
          <span>Progress</span>
        </NavLink>

        <NavLink to="/student-layout/assessment" className="nav-item">
          <ClipboardList size={20} />
          <span>Assessment</span>
        </NavLink>

        <NavLink to="/student-layout/profile" className="nav-item">
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
