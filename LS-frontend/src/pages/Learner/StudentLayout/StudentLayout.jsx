import React, { useState } from "react";
import { useLocation } from "react-router-dom";

import StudentSideBar from "../../../components/SideBar-S/SidebarStudent";
import DashboardHeader from "../../../components/TopNavBar-S/TopNavBarStudent";

import LearnerDashboard from "../Dashboard/Dashboard";
import MyCourses from "../MyCourses/Mycourses";
import Progress from "../Progress/Progress";
import Assessment from "../Assesment/Assesment";
import Profile from "../Profile/Profile";
import LearnCourse from "../LearnCourse/LearnCourse";

import "./StudentLayout.scss";

function StudentLayout() {
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("Dashboard");

  const isLearnPage = location.pathname.includes("/learn/");

  const courseId = location.pathname.split("/learn/")[1];

  const renderContent = () => {
    if (isLearnPage && courseId) {
      return <LearnCourse />;
    }

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
        return <LearnerDashboard />;
    }
  };

  return (
    <StudentSideBar activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="student-layout-content">
        <DashboardHeader activeTab={activeTab} />

        <div className="page-content">
          {renderContent()}
        </div>
      </div>
    </StudentSideBar>
  );
}

export default StudentLayout;