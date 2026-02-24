import { useMemo, useState } from "react";
import {
  Users, Search, Eye, Edit, Ban, UserCheck, MoreVertical
} from "lucide-react";
import "./Manageuser.scss";

function Manageusers(){
  const [users, setUsers] = useState(() => {
    return JSON.parse(window.appStore.getItem("users")) || [];
  });
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
   const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);

  const filteredUsers =useMemo(()=>{
  return users.filter(u => {
    if (activeTab === "Learners" && u.role !== "learner") return false;
    if (activeTab === "Instructors" && u.role !== "instructor") return false;
    if (activeTab === "Suspended" && u.status !== "suspended") return false;
    if (roleFilter !== "All" && u.role !== roleFilter) return false;

    const term=search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term)
    );
  });
  },[users,activeTab,search,roleFilter]);
const updateStorage = (updated) => {
    setUsers(updated);
    window.appStore.setItem("users", JSON.stringify(updated));
  };
  const toggleUserStatus=(id)=>{
    const updated=users.map((u)=>u.id===id?{...u.status==="active"?"suspended":"active"}:u);
    updateStorage(updated);
    //window.appStore.setItem("users",JSON.stringify(updated));
  };
  const deleteUser = (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    const updated = users.filter((u) => u.id !== id);
    updateStorage(updated);
  };
  const changeRole = (newRole) => {
    const updated = users.map((u) =>
      u.id === editUser.id ? { ...u, role: newRole } : u
    );
    updateStorage(updated);
    setEditUser(null);
  };
  return (
    <div className="manage-users-layout">
      <div className="manage-users">
      <div className="tabs">
        {["All", "Learners", "Instructors", "Suspended"].map(tab => (
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
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="all">All roles</option>
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
              filteredUsers.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="user-cell">
                      <div className="avatar">{u.name?.[0]?.toUpperCase()||"U"}</div>
                      <div>
                        <p>{u.name}</p>
                        <span>{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>{u.role}</td>
                  <td className={u.status}>{u.status}</td>
                  <td>{u.createdAt?new Date(u.createdAt).toLocaleDateString():"-"}</td>
                  <td>{u.lastActive}</td>
                  <td className="actions">
                    <Eye size={16} onClick={() => setViewUser(u)}/>
                    <Edit size={16} onClick={() => setEditUser(u)}/>
                    {u.status === "active" ? (<Ban size={16} onClick={()=>toggleUserStatus(u.id)}/>) : (<UserCheck size={16} onClick={()=>toggleUserStatus(u.id)}/>)}
                    <MoreVertical size={16} onClick={() => deleteUser(u.id)}/>
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
            <p><b>Name:</b> {viewUser.name}</p>
            <p><b>Email:</b> {viewUser.email}</p>
            <p><b>Role:</b> {viewUser.role}</p>
            <p><b>Status:</b> {viewUser.status}</p>
            <p>
              <b>Joined:</b>{" "}
              {viewUser.createdAt
                ? new Date(viewUser.createdAt).toLocaleString()
                : "-"}
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

            <select
              defaultValue={editUser.role}
              onChange={(e) => changeRole(e.target.value)}
            >
              <option value="learner">Learner</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default Manageusers;
