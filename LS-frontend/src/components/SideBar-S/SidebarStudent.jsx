import { Link, NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, BookOpen, Award, User, LogOut } from "lucide-react";
import logo from "../../assets/Logo/logo.png";
import { logoutUser } from "../../services/userProfileStore";
import "./SidebarStudent.scss";

function SidebarStudent() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isAdminPreview = searchParams.get("adminPreview") === "true";
  const previewQuery = isAdminPreview ? `?${searchParams.toString()}` : "";
  const withPreview = (path) => `${path}${previewQuery}`;

  const handleLogout = () => {
    logoutUser();
  };

  return (
    <nav className="L-navbar">
      <Link to="/" className="logo-name" aria-label="LearnSphere Home">
        <img src={logo} className="logo" alt="logo" />
        <span className="page-name">LearnSphere</span>
      </Link>

      <div className="L-sidebar">
        <NavLink to={withPreview("/student-layout/dashboard")} className="nav-item">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to={withPreview("/student-layout/my-courses")} className="nav-item">
          <BookOpen size={20} />
          <span>My Courses</span>
        </NavLink>

        <NavLink to={withPreview("/student-layout/certificate")} className="nav-item">
          <Award size={20} />
          <span>Certificates</span>
        </NavLink>

        <NavLink to={withPreview("/student-layout/profile")} className="nav-item">
          <User size={20} />
          <span>My Profile</span>
        </NavLink>

        {isAdminPreview ? (
          <NavLink to="/admin-layout/users" className="nav-item logout">
            <LogOut size={20} />
            <span>Back to Admin</span>
          </NavLink>
        ) : (
          <NavLink to="/login" className="nav-item logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
}

export default SidebarStudent;
