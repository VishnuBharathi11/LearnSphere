import { Navigate, useLocation, useOutlet } from "react-router-dom";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import StudentSideBar from "../../../components/SideBar-S/SidebarStudent";
import TopNavBarStudent from "../../../components/TopNavBar-S/TopNavBarStudent";
import "./StudentLayout.scss";

function StudentLayout() {
  const location = useLocation();
  const outlet = useOutlet();
  const { currentUser, loading } = useCurrentUser();
  const role = String(currentUser?.role || "").toLowerCase();
  const search = new URLSearchParams(location.search);
  const isAdminPreview = search.get("adminPreview") === "true" && role === "admin";

  if (loading) {
    return null;
  }

  if (!currentUser || (role !== "learner" && !isAdminPreview)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={`student-layout ${isAdminPreview ? "admin-preview-mode" : ""}`}>
      <StudentSideBar />
      <div className="student-main">
        <TopNavBarStudent />
        <div className="dashboard-body">
          <main className="page-content" key={location.key}>{outlet}</main>
        </div>
      </div>
    </div>
  );
}

export default StudentLayout;
