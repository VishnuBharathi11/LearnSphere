import { Outlet } from "react-router-dom";
import StudentSideBar from "../../../components/SideBar-S/SidebarStudent";
import TopNavBarStudent from "../../../components/TopNavBar-S/TopNavBarStudent";
import "./StudentLayout.scss";

function StudentLayout() {
  return (
    <div className="student-layout">
      <StudentSideBar />
      <div className="student-main">
        <TopNavBarStudent />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default StudentLayout;
