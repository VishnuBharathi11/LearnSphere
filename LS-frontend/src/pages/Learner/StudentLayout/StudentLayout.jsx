import { Navigate, useLocation, useOutlet } from "react-router-dom";
import { getCurrentUser } from "../../../services/userProfileStore.js";
import StudentSideBar from "../../../components/SideBar-S/SidebarStudent";
import TopNavBarStudent from "../../../components/TopNavBar-S/TopNavBarStudent";
import "./StudentLayout.scss";

function StudentLayout() {
  const location = useLocation();
  const outlet = useOutlet();
  const currentUser = getCurrentUser();
  const role = String(currentUser?.role || "").toLowerCase();
  const search = new URLSearchParams(location.search);
  const isAdminPreview = search.get("adminPreview") === "true" && role === "admin";

  if (!currentUser || (role !== "learner" && !isAdminPreview)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="student-layout">
      <StudentSideBar />
      <div className="student-main">
        <TopNavBarStudent />
        <div className="page-content" key={location.key}>{outlet}</div>
      </div>
    </div>
  );
}

export default StudentLayout;

