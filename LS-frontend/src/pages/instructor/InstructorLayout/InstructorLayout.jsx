import { Outlet } from "react-router-dom";
import InstructorSideBar from "../../../components/SideBar-I/SidebarInstructor";
import TopNavBarInstructor from "../../../components/TopNavBar-I/TopNavBarInstructor";
import "./InstructorLayout.scss";

function InstructorLayout() {
  return (
    <div className="instructor-layout">
      <InstructorSideBar />

      <div className="instructor-main">
        <TopNavBarInstructor />

        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default InstructorLayout;
