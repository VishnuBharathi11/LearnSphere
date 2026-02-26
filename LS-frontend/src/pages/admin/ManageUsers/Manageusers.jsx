import { useEffect, useMemo, useState } from "react";
import { Users, Search, Eye, Edit, Ban, UserCheck, Trash2, X } from "lucide-react";
import {
  deleteAdminUser,
  getAdminUsers,
  suspendAdminUser,
  updateAdminUserRole,
} from "../../../services/adminApi";
import { getFriendlyErrorMessage } from "../../../services/apiError";
import "./Manageuser.scss";

function Manageusers() {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [error, setError] = useState("");

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

  const changeRole = async (newRole) => {
    if (!editUser) return;
    try {
      await updateAdminUserRole(editUser.id, newRole);
      setEditUser(null);
      await loadUsers();
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError, "Failed to update user role"));
    }
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
                  <tr key={user.id}>
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
                      <Eye size={16} onClick={() => setViewUser(user)} />
                      <Edit size={16} onClick={() => setEditUser(user)} />
                      {String(user.status).toLowerCase() === "suspended" ? (
                        <UserCheck size={16} onClick={() => toggleUserStatus(user)} />
                      ) : (
                        <Ban size={16} onClick={() => toggleUserStatus(user)} />
                      )}
                      <Trash2 size={16} onClick={() => deleteUser(user.id)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewUser && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close" onClick={() => setViewUser(null)}>
              <X size={18} />
            </button>

            <h3>User Details</h3>
            <p>
              <b>Name:</b> {viewUser.name}
            </p>
            <p>
              <b>Email:</b> {viewUser.email}
            </p>
            <p>
              <b>Role:</b> {viewUser.role}
            </p>
            <p>
              <b>Status:</b> {viewUser.status}
            </p>
            <p>
              <b>Joined:</b> {viewUser.createdAt ? new Date(viewUser.createdAt).toLocaleString() : "-"}
            </p>
          </div>
        </div>
      )}

      {editUser && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close" onClick={() => setEditUser(null)}>
              <X size={18} />
            </button>

            <h3>Edit User Role</h3>

            <select defaultValue={editUser.role} onChange={(e) => changeRole(e.target.value)}>
              <option value="learner">Learner</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

export default Manageusers;

