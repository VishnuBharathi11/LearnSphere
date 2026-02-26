import { Navigate, Outlet, useLocation } from "react-router-dom";
import InstructorSideBar from "../../../components/SideBar-I/SidebarInstructor";
import TopNavBarInstructor from "../../../components/TopNavBar-I/TopNavBarInstructor";
import { getCurrentUser } from "../../../services/userProfileStore.js";
import "./InstructorLayout.scss";

function InstructorLayout() {
  const location = useLocation();
  const currentUser = getCurrentUser();
  const role = String(currentUser?.role || "").toLowerCase();
  const search = new URLSearchParams(location.search);
  const isAdminPreview = search.get("adminPreview") === "true" && role === "admin";
  if (!currentUser || (role !== "instructor" && !isAdminPreview)) {
    return <Navigate to="/login" replace />;
  }

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

