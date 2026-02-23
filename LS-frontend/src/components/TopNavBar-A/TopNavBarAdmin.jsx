import { useLocation } from "react-router-dom";
import { FiBell } from "react-icons/fi";
import "./TopNavBarAdmin.scss";

function TopNavBarAdmin() {
  const location = useLocation();

  const pageMap = {
    "/admin-layout/dashboard": (
      <div className="page-title">
        <div>System Overview</div>
        <span className="sub-head">Welcome back,Admin User!</span>
      </div>
    ),
    "/admin-layout/users": (
      <div className="page-title">
        <div>Manage Users</div>
        <span className="sub-head">Students, Instructors and Admins</span>
      </div>
    ),
    "/admin-layout/courses": (
      <div className="page-title">
        <div>Manage Courses</div>
        <span className="sub-head">Oversee all courses in the platform</span>
      </div>
    ),
    "/admin-layout/approve-courses": (
      <div className="page-title">
        <div>Approve / Reject Courses</div>
        <span className="sub-head">Review and approve course submissions</span>
      </div>
    ),
    "/admin-layout/categories": (
      <div className="page-title">
        <div>Category Management</div>
        <span className="sub-head">Manage course categories</span>
      </div>
    ),
    "/admin-layout/roles": (
      <div className="page-title">
        <div>Role Management</div>
        <span className="sub-head">Manage user roles and permissions</span>
      </div>
    ),
    "/admin-layout/settings": (
      <div className="page-title">
        <div>Platform Settings</div>
        <span className="sub-head">Manage system-wide settings</span>
      </div>
    ),
    "/admin-layout/forum": (
      <div className="page-title">
        <div>Discussion</div>
        <span className="sub-head">Moderate and participate in course discussions</span>
      </div>
    ),
    "/courses/forum": (
      <div className="page-title">
        <div>Discussion</div>
        <span className="sub-head">Moderate and participate in course discussions</span>
      </div>
    ),
    "/forum/topic": (
      <div className="page-title">
        <div>Discussion</div>
        <span className="sub-head">Moderate and participate in course discussions</span>
      </div>
    ),
  };

  const normalizedPath =
    location.pathname.startsWith("/courses/") && location.pathname.endsWith("/forum")
      ? "/courses/forum"
      : location.pathname.startsWith("/admin-layout/forum/topic/")
        ? "/forum/topic"
      : location.pathname.startsWith("/forum/topic/")
        ? "/forum/topic"
        : location.pathname;

  const pageTitle = pageMap[normalizedPath] || "Dashboard";

  return (
    <div className="dashboard-header">
      <div className="header-left">
        <h1>{pageTitle}</h1>
      </div>

      <div className="header-right">
        <div className="notification">
          <FiBell />
          <span className="badge">2</span>
        </div>

        <div className="profile">
          <div className="avatar">AD</div>
          <div className="profile-info">
            <span className="name">Admin User</span>
            <span className="email">admin@learnsphere.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopNavBarAdmin;
