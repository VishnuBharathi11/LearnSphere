import { Navigate } from "react-router-dom";
import StudentLayout from "../../pages/Learner/StudentLayout/StudentLayout.jsx";
import InstructorLayout from "../../pages/instructor/InstructorLayout/InstructorLayout.jsx";
import AdminLayout from "../../pages/admin/AdminLayout/AdminLayout.jsx";

const getCurrentUser = () => {
  try {
    const raw = window.appStore.getItem("currentUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const resolveLayoutByRole = (rawRole) => {
  const role = String(rawRole || "").trim().toLowerCase();

  if (role.includes("instructor") || role.includes("teacher")) {
    return InstructorLayout;
  }

  if (role.includes("admin")) {
    return AdminLayout;
  }

  return StudentLayout;
};

const ForumRoleLayout = () => {
  const currentUser = getCurrentUser();
  const SelectedLayout = resolveLayoutByRole(currentUser?.role);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <SelectedLayout />;
};

export default ForumRoleLayout;
