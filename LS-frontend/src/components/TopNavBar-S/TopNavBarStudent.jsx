import { useLocation } from "react-router-dom";
import { FiBell } from "react-icons/fi";
import "./TopNavBarStudent.scss";

function TopNavBarStudent() {
  const location = useLocation();

  const pageMap = {
    "/student-layout/dashboard": "Dashboard",
    "/student-layout/my-courses": "My Courses",
    "/student-layout/progress": "Progress",
    "/student-layout/assessment": "Assessment",
    "/student-layout/profile": "My Profile",
  };

  const pageTitle = pageMap[location.pathname] || "Dashboard";

  return (
    <div className="dashboard-header">
      <div className="header-left">
        <h2>{pageTitle}</h2>
      </div>

      <div className="header-right">
        <div className="notification">
          <FiBell />
          <span className="badge">2</span>
        </div>

        <div className="profile">
          <div className="avatar">PM</div>
          <div className="profile-info">
            <span className="name">Peter Parker</span>
            <span className="email">peter@gmail.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopNavBarStudent;