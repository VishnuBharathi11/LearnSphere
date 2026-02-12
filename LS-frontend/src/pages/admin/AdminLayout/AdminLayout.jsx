import { Outlet } from "react-router-dom";
import AdminSideBar from "../../../components/SideBar-A/SidebarAdmin";
import TopNavBarAdmin from "../../../components/TopNavBar-A/TopNavBarAdmin";
import "./AdminLayout.scss";

function AdminLayout() {
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
