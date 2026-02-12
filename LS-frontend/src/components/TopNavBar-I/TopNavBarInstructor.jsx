import { useLocation } from "react-router-dom";
import { FiBell } from "react-icons/fi";
import "./TopNavBarInstructor.scss";

function TopNavBarInstructor() {
  const location = useLocation();

  const pageMap = {
    "/instructor-layout/dashboard": (
      <div className="page-title">
        <div>Instructor Dashboard</div>
        <span className="sub-head">Welcome back, Instructor!</span>
      </div>
    ),

    "/instructor-layout/create-course": (
      <div className="page-title">
        <div>Create Course</div>
        <span className="sub-head">Build and publish your course</span>
      </div>
    ),

    "/instructor-layout/manage-courses": (
      <div className="page-title">
        <div>Manage Courses</div>
        <span className="sub-head">Manage your created courses</span>
      </div>
    ),

    "/instructor-layout/discussions": (
      <div className="page-title">
        <div>Discussions</div>
        <span className="sub-head">Interact with students</span>
      </div>
    ),

    "/instructor-layout/profile": (
      <div className="page-title">
        <div>My Profile</div>
        <span className="sub-head">Manage personal details</span>
      </div>
    ),
  };

  let pageTitle = pageMap[location.pathname];

  // 🔥 NEW LOGIC FOR MANAGE COURSE INNER PAGES

  if (location.pathname.includes("/manage-courses/") && location.pathname.includes("/lessons")) {
    pageTitle = (
      <div className="page-title">
        <div>Upload Lesson</div>
        <span className="sub-head">Add or update course lessons</span>
      </div>
    );
  }

  else if (location.pathname.includes("/manage-courses/") && location.pathname.includes("/quiz")) {
    pageTitle = (
      <div className="page-title">
        <div>Create Quiz</div>
        <span className="sub-head">Add quizzes to your course</span>
      </div>
    );
  }

  else if (location.pathname.includes("/manage-courses/") && location.pathname.includes("/students")) {
    pageTitle = (
      <div className="page-title">
        <div>Students</div>
        <span className="sub-head">View enrolled students</span>
      </div>
    );
  }

  else if (location.pathname.includes("/manage-courses/") && location.pathname.includes("/analytics")) {
    pageTitle = (
      <div className="page-title">
        <div>Analytics</div>
        <span className="sub-head">Course performance insights</span>
      </div>
    );
  }

  // Default fallback
  if (!pageTitle) {
    pageTitle = (
      <div className="page-title">
        <div>Instructor Dashboard</div>
        <span className="sub-head">Welcome back, Instructor!</span>
      </div>
    );
  }

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
          <div className="avatar">IN</div>
          <div className="profile-info">
            <span className="name">Instructor User</span>
            <span className="email">instructor@learnsphere.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopNavBarInstructor;
