import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CheckCircle,
  Layers,
  UserCog,
  BadgeCheck,
  Award,
  Settings,
  LogOut,
  PlusSquare,
  FolderKanban,
  User,
  WalletCards,
  Mail,
} from "lucide-react";
import { logoutUser } from "../../services/userProfileStore";
import "./Sidebar.scss";

function Sidebar({ role }) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isAdminPreview = searchParams.get("adminPreview") === "true";
  const previewQuery = isAdminPreview ? `?${searchParams.toString()}` : "";

  const withPreview = (path) => `${path}${previewQuery}`;

  const isActive = (path) => {
    if (path === "/admin-layout/dashboard" || path === "/instructor-layout/dashboard" || path === "/student-layout/dashboard") {
      return location.pathname === path ? "active" : "";
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`) ? "active" : "";
  };

  const handleLogout = () => {
    if (!isAdminPreview) {
      logoutUser();
    }
  };

  // Get menu items depending on current role
  const getMenuItems = () => {
    switch (role) {
      case "admin":
        return [
          { to: "/admin-layout/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { to: "/admin-layout/users", label: "Manage Users", icon: Users },
          { to: "/admin-layout/courses", label: "Manage Courses", icon: BookOpen },
          { to: "/admin-layout/approve-courses", label: "Approve Courses", icon: CheckCircle },
          { to: "/admin-layout/categories", label: "Categories", icon: Layers },
          { to: "/admin-layout/roles", label: "Role Management", icon: UserCog },
          { to: "/admin-layout/instructor-applications", label: "Instructor Registration", icon: BadgeCheck },
          { to: "/admin-layout/contact-submissions", label: "Contact Messages", icon: Mail },
          { to: "/admin-layout/settings", label: "Settings", icon: Settings },
          { to: "/admin-layout/certificate-templates", label: "Certificate Templates", icon: Award },
        ];
      case "instructor":
        return [
          { to: "/instructor-layout/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { to: "/instructor-layout/create-course", label: "Create Course", icon: PlusSquare },
          { to: "/instructor-layout/manage-courses", label: "Manage Courses", icon: FolderKanban },
          { to: "/instructor-layout/withdrawals", label: "Withdrawals", icon: WalletCards },
          { to: "/instructor-layout/profile", label: "My Profile", icon: User },
        ];
      case "learner":
      case "student":
      default:
        return [
          { to: "/student-layout/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { to: "/student-layout/my-courses", label: "My Courses", icon: BookOpen },
          { to: "/student-layout/certificate", label: "Certificates", icon: Award },
          { to: "/student-layout/profile", label: "My Profile", icon: User },
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <nav className={`sidebar-navbar sidebar-${role}`}>
      <Link to="/" className="sidebar-logo" aria-label="LearnSphere Home">
        <span className="logo-text">LearnSphere</span>
      </Link>
      <div className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={withPreview(item.to)}
              className={`menu-item-link ${isActive(item.to)}`}
            >
              <Icon size={18} />
              <span className="link-label">{item.label}</span>
            </Link>
          );
        })}
        {isAdminPreview ? (
          <Link to="/admin-layout/users" className="menu-item-link logout-link">
            <LogOut size={18} />
            <span className="link-label">Back to Admin</span>
          </Link>
        ) : (
          <Link to="/login" className="menu-item-link logout-link" onClick={handleLogout}>
            <LogOut size={18} />
            <span className="link-label">Logout</span>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Sidebar;
