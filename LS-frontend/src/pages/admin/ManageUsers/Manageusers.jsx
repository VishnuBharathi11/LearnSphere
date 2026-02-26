import { useEffect, useMemo, useState } from "react";
import { Users, Search, Ban, UserCheck, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  deleteAdminUser,
  getAdminUsers,
  suspendAdminUser,
} from "../../../services/adminApi";
import { getFriendlyErrorMessage } from "../../../services/apiError";
import "./Manageuser.scss";

function Manageusers() {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadUsers = async () => {
    try {
      const list = await getAdminUsers();
      setUsers(Array.isArray(list) ? list : []);
      setError("");
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError, "Failed to load users"));
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (activeTab === "Learners" && String(user.role).toLowerCase() !== "learner") return false;
      if (activeTab === "Instructors" && String(user.role).toLowerCase() !== "instructor") return false;
      if (activeTab === "Suspended" && String(user.status).toLowerCase() !== "suspended") return false;
      if (roleFilter !== "All" && String(user.role).toLowerCase() !== roleFilter.toLowerCase()) return false;

      const term = search.toLowerCase();
      return (
        String(user.name || "").toLowerCase().includes(term) ||
        String(user.email || "").toLowerCase().includes(term)
      );
    });
  }, [users, activeTab, search, roleFilter]);

  const toggleUserStatus = async (user) => {
    try {
      const suspend = String(user.status).toLowerCase() !== "suspended";
      await suspendAdminUser(user.id, suspend);
      await loadUsers();
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError, "Failed to update user status"));
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user account?")) return;
    try {
      await deleteAdminUser(id);
      await loadUsers();
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError, "Failed to delete user"));
    }
  };

  const openUserPortal = (user) => {
    const role = String(user.role || "").toLowerCase();
    const params = new URLSearchParams({
      adminPreview: "true",
      adminUserId: String(user.id || ""),
      adminUserName: String(user.name || ""),
      adminUserEmail: String(user.email || ""),
      adminUserRole: role,
    });

    if (role === "instructor") {
      navigate(`/instructor-layout/profile?${params.toString()}`);
      return;
    }
    navigate(`/student-layout/profile?${params.toString()}`);
  };

  return (
    <div className="manage-users-layout">
      <div className="manage-users">
        {error && <p className="admin-error">{error}</p>}

        <div className="tabs">
          {["All", "Learners", "Instructors", "Suspended"].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "tab active" : "tab"}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="filters">
          <div className="search-box">
            <Search size={16} />
            <input
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="All">All roles</option>
            <option value="learner">Learner</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty">
                    <Users size={32} />
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="row-clickable" onClick={() => openUserPortal(user)}>
                    <td>
                      <div className="user-cell">
                        <div className="avatar">{user.name?.[0]?.toUpperCase() || "U"}</div>
                        <div>
                          <p>{user.name}</p>
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{user.role}</td>
                    <td className={user.status}>{user.status}</td>
                    <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</td>
                    <td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "-"}</td>
                    <td className="actions">
                      {String(user.status).toLowerCase() === "suspended" ? (
                        <button
                          type="button"
                          className="icon-action activate"
                          title="Activate user"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleUserStatus(user);
                          }}
                        >
                          <UserCheck size={16} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="icon-action suspend"
                          title="Suspend user"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleUserStatus(user);
                          }}
                        >
                          <Ban size={16} />
                        </button>
                      )}
                      <button
                        type="button"
                        className="icon-action delete"
                        title="Delete user"
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteUser(user.id);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Manageusers;
