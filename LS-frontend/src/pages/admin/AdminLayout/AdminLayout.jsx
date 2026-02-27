import { Navigate, Outlet } from "react-router-dom";
import AdminSideBar from "../../../components/SideBar-A/SidebarAdmin";
import TopNavBarAdmin from "../../../components/TopNavBar-A/TopNavBarAdmin";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import "./AdminLayout.scss";

function AdminLayout() {
  const { currentUser, loading } = useCurrentUser();
  const role = String(currentUser?.role || "").toLowerCase();
  if (loading) {
    return null;
  }
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

