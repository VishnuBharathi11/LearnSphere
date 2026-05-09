import { Navigate } from "react-router-dom";
import StudentLayout from "../Learner/StudentLayout/StudentLayout.jsx";
import InstructorLayout from "../instructor/InstructorLayout/InstructorLayout.jsx";
import AdminLayout from "../admin/AdminLayout/AdminLayout.jsx";
import { useCurrentUser } from "../../hooks/useCurrentUser";

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
  const { currentUser, loading } = useCurrentUser();
  const SelectedLayout = resolveLayoutByRole(currentUser?.role);

  if (loading) {
    return null;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <SelectedLayout />;
};

export default ForumRoleLayout;

