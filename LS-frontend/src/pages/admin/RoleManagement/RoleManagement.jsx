import { useEffect, useState } from "react";
import { Shield, Plus, Edit, Trash2, X } from "lucide-react";
import { getAdminRoles, saveAdminRolePermissions } from "../../../services/adminApi";
import { getFriendlyErrorMessage } from "../../../services/apiError";
import "./RoleManagement.scss";

function RoleManagement() {
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");
  const ALL_PERMISSIONS = [
    "View Dashboard",
    "Manage Users",
    "Manage Courses",
    "Approve Courses",
    "Manage Categories",
    "Upload Lessons",
    "Create Courses",
    "Create Quizzes",
    "View Student Progress",
    "Content Moderation",
    "Moderate Discussions",
    "View Reports",
    "System Settings",
    "Manage Roles",
  ];

  const [formData, setFormData] = useState({
    role: "",
    permissions: [],
  });

  const loadRoles = async () => {
    try {
      const data = await getAdminRoles();
      setRoles(Array.isArray(data) ? data : []);
      setError("");
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError, "Failed to load role permissions"));
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const openCreate = () => {
    setEditingRole(null);
    setFormData({ role: "", permissions: [] });
    setShowModal(true);
  };

  const openEdit = (role) => {
    setEditingRole(role);
    setFormData({
      role: role.role,
      permissions: [...(role.permissions || [])],
    });
    setShowModal(true);
  };

  const handleDeleteRole = async (roleName) => {
    const confirmDelete = window.confirm("Delete this role permissions?");
    if (!confirmDelete) return;
    try {
      await saveAdminRolePermissions({ role: roleName, permissions: [] });
      await loadRoles();
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError, "Failed to delete role permissions"));
    }
  };

  const togglePermission = (permission) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((item) => item !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await saveAdminRolePermissions({
        role: formData.role,
        permissions: formData.permissions,
      });
      setShowModal(false);
      await loadRoles();
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError, "Failed to save role permissions"));
    }
  };

  return (
    <div className="admin-layout">
      <div className="admin-content">
        {error && <p className="admin-error">{error}</p>}

        <main className="role-container">
          {roles.map((role) => (
            <div className="role-card" key={role.role}>
              <div className="role-actions">
                <button className="edit-btn" onClick={() => openEdit(role)} title="Edit Role">
                  <Edit size={16} />
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleDeleteRole(role.role)}
                  title="Delete Role Permissions"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="role-header">
                <Shield size={26} />
                <div>
                  <h3>{role.role}</h3>
                  <span>{role.users} users</span>
                </div>
              </div>

              <p className="role-desc">Configured permissions for {role.role}</p>

              <div className="permission-list">
                {(role.permissions || []).map((permission) => (
                  <span key={permission} className="permission-pill">
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          ))}

          <button className="role-add" onClick={openCreate}>
            <Plus size={28} />
            <span>Create Role</span>
          </button>
        </main>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingRole ? "Edit Role" : "Create Role"}</h2>
              <button onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              <label>
                Role Name
                <input
                  required
                  disabled={Boolean(editingRole)}
                  value={formData.role}
                  onChange={(event) => setFormData({ ...formData, role: event.target.value })}
                />
              </label>

              <div className="permission-box">
                {ALL_PERMISSIONS.map((permission) => (
                  <label key={permission} className="perm-item">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(permission)}
                      onChange={() => togglePermission(permission)}
                    />
                    {permission}
                  </label>
                ))}
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  Save
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleManagement;

