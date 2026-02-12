import React, { useState } from "react";
import { Shield, Plus, Edit, Trash2, X } from "lucide-react";
import "./RoleManagement.scss";

function RoleManagement() {
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
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
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: "Admin",
      description: "Full access to the admin system",
      users: 2,
      permissions: ALL_PERMISSIONS,
    },
    {
      id: 2,
      name: "Instructor",
      description: "Manages courses and student progress",
      users: 132,
      permissions: [
        "View Dashboard",
        "Manage Courses",
        "Create Courses",
        "Upload Lessons",
        "Create Quizzes",
        "View Student Progress",
        "Moderate Discussions",
      ],
    },
    {
      id: 3,
      name: "Student",
      description: "Basic learning access",
      users: 2156,
      permissions: ["View Dashboard"],
    },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [],
  });

  const openCreate = () => {
    setEditingRole(null);
    setFormData({ name: "", description: "", permissions: [] });
    setShowModal(true);
  };

  const openEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
    });
    setShowModal(true);
  };
  const handleDeleteRole = (roleId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this role?",
    );

    if (!confirmDelete) return;

    setRoles((prev) => prev.filter((role) => role.id !== roleId));
  };

  const togglePermission = (permission) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingRole) {
      setRoles((prev) =>
        prev.map((r) => (r.id === editingRole.id ? { ...r, ...formData } : r)),
      );
    } else {
      setRoles((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          users: 0,
          ...formData,
        },
      ]);
    }

    setShowModal(false);
  };

  return (
    <div className="admin-layout">

      <div className="admin-content">
        <main className="role-container">
          {roles.map((role) => (
            <div className="role-card" key={role.id}>
              <div className="role-actions">
                <button
                  className="edit-btn"
                  onClick={() => openEdit(role)}
                  title="Edit Role"
                >
                  <Edit size={16} />
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleDeleteRole(role.id)}
                  title="Delete Role"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="role-header">
                <Shield size={26} />
                <div>
                  <h3>{role.name}</h3>
                  <span>{role.users} users</span>
                </div>
              </div>

              <p className="role-desc">{role.description}</p>

              <div className="permission-list">
                {role.permissions.map((p) => (
                  <span key={p} className="permission-pill">
                    {p}
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
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </label>

              <label>
                Description
                <textarea
                  required
                  rows="3"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </label>

              <div className="permission-box">
                {ALL_PERMISSIONS.map((perm) => (
                  <label key={perm} className="perm-item">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(perm)}
                      onChange={() => togglePermission(perm)}
                    />
                    {perm}
                  </label>
                ))}
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  Save
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
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
