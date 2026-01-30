import { useState } from "react";
import {
  Users, Search, Eye, Edit, Ban, UserCheck, MoreVertical
} from "lucide-react";
// import "./Manageuser.css";
import SidebarAdmin from "../../../components/SideBar-A/SidebarAdmin";

function Manageusers(){
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const users = [
    { id: 1, name: "Rahul Sharma", email: "rahul@gmail.com", role: "student", status: "active", joined: "2024-12-25", lastActive: "2 hours ago" },
    { id: 2, name: "Priya Patel", email: "priya@gmail.com", role: "instructor", status: "active", joined: "2024-12-25", lastActive: "1 day ago" },
    { id: 3, name: "Sneha Reddy", email: "sneha@gmail.com", role: "instructor", status: "suspended", joined: "2024-12-25", lastActive: "2 weeks ago" }
  ];
  const filteredUsers = users.filter(u => {
    if (activeTab === "students" && u.role !== "student") return false;
    if (activeTab === "instructors" && u.role !== "instructor") return false;
    if (activeTab === "suspended" && u.status !== "suspended") return false;
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    return (
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
  });
  return (
    <div className="manage-users-layout">
      <SidebarAdmin/>
      <div className="manage-users">
      <h2 className="page-title">Manage Users</h2>
      <p className="page-subtitle">Students, instructors and admins</p>
      <div className="tabs">
        {["all", "students", "instructors", "suspended"].map(tab => (
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
          <option value="student">Student</option>
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
              <th></th>
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
                      <div className="avatar">{u.name[0]}</div>
                      <div>
                        <p>{u.name}</p>
                        <span>{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>{u.role}</td>
                  <td className={u.status}>{u.status}</td>
                  <td>{u.joined}</td>
                  <td>{u.lastActive}</td>
                  <td className="actions">
                    <Eye size={16} />
                    <Edit size={16} />
                    {u.status === "active" ? <Ban size={16} /> : <UserCheck size={16} />}
                    <MoreVertical size={16} />
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
};

export default Manageusers;
