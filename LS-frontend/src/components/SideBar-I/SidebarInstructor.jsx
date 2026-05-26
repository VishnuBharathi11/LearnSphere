import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PlusSquare,
  FolderKanban,
  User,
  LogOut,
  WalletCards,
} from "lucide-react";
import logo from "../../assets/Logo/logo.png";
import { logoutUser } from "../../services/userProfileStore";
import "./SidebarInstructor.scss";

function SidebarInstructor() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isAdminPreview = searchParams.get("adminPreview") === "true";
  const previewQuery = isAdminPreview ? `?${searchParams.toString()}` : "";
  const withPreview = (path) => `${path}${previewQuery}`;

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleLogout = () => {
    logoutUser();
  };

  return (
    <nav className="I-navbar">
      <Link to="/" className="logo-name" aria-label="LearnSphere Home">
        <img src={logo} className="logo" alt="LearnSphere" />
        <div className="page-name">LearnSphere</div>
      </Link>

      <div className="I-sidebar">
        <Link
          to={withPreview("/instructor-layout/dashboard")}
          className={isActive("/instructor-layout/dashboard") ? "active" : ""}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        <Link
          to={withPreview("/instructor-layout/create-course")}
          className={isActive("/instructor-layout/create-course") ? "active" : ""}
        >
          <PlusSquare size={18} />
          Create Course
        </Link>

        <Link
          to={withPreview("/instructor-layout/manage-courses")}
          className={isActive("/instructor-layout/manage-courses") ? "active" : ""}
        >
          <FolderKanban size={18} />
          Manage Courses
        </Link>

        <Link
          to={withPreview("/instructor-layout/withdrawals")}
          className={isActive("/instructor-layout/withdrawals") ? "active" : ""}
        >
          <WalletCards size={18} />
          Withdrawals
        </Link>

        <Link
          to={withPreview("/instructor-layout/profile")}
          className={isActive("/instructor-layout/profile") ? "active" : ""}
        >
          <User size={18} />
          My Profile
        </Link>

        {isAdminPreview ? (
          <Link to="/admin-layout/users" className="logout">
            <LogOut size={20} />
            Back to Admin
          </Link>
        ) : (
          <Link to="/login" className="logout" onClick={handleLogout}>
            <LogOut size={20} />
            Logout
          </Link>
        )}
      </div>
    </nav>
  );
}

export default SidebarInstructor;
