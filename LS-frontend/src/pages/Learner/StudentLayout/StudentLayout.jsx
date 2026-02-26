import { Navigate, useLocation, useOutlet } from "react-router-dom";
import { getCurrentUser } from "../../../services/userProfileStore";
import StudentSideBar from "../../../components/SideBar-S/SidebarStudent";
import TopNavBarStudent from "../../../components/TopNavBar-S/TopNavBarStudent";
import "./StudentLayout.scss";

function StudentLayout() {
  const location = useLocation();
  const outlet = useOutlet();
  const currentUser = getCurrentUser();
  const role = String(currentUser?.role || "").toLowerCase();

  if (!currentUser || role !== "learner") {
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
