import { Navigate, Outlet } from "react-router-dom";
import AdminSideBar from "../../../components/SideBar-A/SidebarAdmin";
import TopNavBarAdmin from "../../../components/TopNavBar-A/TopNavBarAdmin";
import { getCurrentUser } from "../../../services/userProfileStore.js";
import "./AdminLayout.scss";

function AdminLayout() {
  const currentUser = getCurrentUser();
  const role = String(currentUser?.role || "").toLowerCase();
  if (!currentUser || role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-layout">
      <AdminSideBar />

      <div className="admin-main">
        <TopNavBarAdmin />

        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;

