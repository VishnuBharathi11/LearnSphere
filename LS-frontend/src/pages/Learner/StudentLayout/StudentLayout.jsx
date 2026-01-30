import React, { useState } from "react";
import StudentSideBar from "../../../components/SideBar-S/SidebarStudent";
import DashboardHeader from "../../../components/TopNavBar-S/TopNavBarStudent";
import LearnerDashboard from "../Dashboard/Dashboard";
import MyCourses from "../MyCourses/Mycourses";
import Progress from "../Progress/Progress";
import Assessment from "../Assesment/Assesment";
import Profile from "../Profile/Profile";
import "./StudentLayout.scss";
function  StudentLayout() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return <LearnerDashboard />;
      case "My Courses":
        return <MyCourses />;
      case "Progress":
        return <Progress />;
      case "Assessment":
        return <Assessment />;
      case "Profile":
        return <Profile />;
      default:
        return null;
    }
  };

  return (
    <StudentSideBar activeTab={activeTab} setActiveTab={setActiveTab}>
       <div className="student-layout-content">
              <DashboardHeader activeTab={activeTab} />
      <div className="page-content">{renderContent()}</div>
       </div>
    </StudentSideBar>
  );
}
export default StudentLayout