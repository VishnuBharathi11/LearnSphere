import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  ClipboardList,
  Award,
  User,
  LogOut,
} from "lucide-react";

import logo from "../../assets/Logo/logo.png";
import "./SidebarStudent.scss";

function SidebarStudent() {
  const handleLogout = () => {
    window.appStore.removeItem("currentUser");
    window.appStore.removeItem("isLoggedIn");
    window.appStore.removeItem("authToken");
  };

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

        <NavLink to="/student-layout/progress" className="nav-item">
          <BarChart3 size={20} />
          <span>Progress</span>
        </NavLink>

        <NavLink to="/student-layout/assessment" className="nav-item">
          <ClipboardList size={20} />
          <span>Assessment</span>
        </NavLink>

        <NavLink to="/student-layout/certificate" className="nav-item">
          <Award size={20} />
          <span>Certificates</span>
        </NavLink>

        <NavLink to="/student-layout/profile" className="nav-item">
          <User size={20} />
          <span>My Profile</span>
        </NavLink>

        <NavLink to="/login" className="nav-item logout" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </NavLink>
      </div>
    </nav>
  );
}

export default SidebarStudent;
