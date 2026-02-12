import { useLocation } from "react-router-dom";
import { FiBell } from "react-icons/fi";
import "./TopNavBarInstructor.scss";

function TopNavBarInstructor() {
  const location = useLocation();

  const pageMap = {
    "/instructor-layout/dashboard": "Dashboard",
    "/instructor-layout/create-course": "Create Course",
    "/instructor-layout/discussions": "Discussions",
    "/instructor-layout/profile": "My Profile",
  };

  let pageTitle = "Dashboard";

  if (location.pathname.startsWith("/instructor-layout/manage-courses")) {
    pageTitle = "Manage Courses";
  } else {
    pageTitle = pageMap[location.pathname] || "Dashboard";
  }

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

export default TopNavBarInstructor;
