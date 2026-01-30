import React, { useMemo, useState } from "react";
import {
  MessageSquare,
  Clock,
  AlertTriangle,
  CheckCircle,
  Search,
  Eye,
  Check,
  X,
  Flag,
} from "lucide-react";
import "./Discussion.scss";
import SidebarInstructor from "../../../components/SideBar-I/SidebarInstructor";
function Discussion() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [discussions, setDiscussions] = useState(() => {
    return JSON.parse(localStorage.getItem("courseDiscussions")) || [];
  });
  const stats = useMemo(() => {
    return {
      total: discussions.length,
      pending: discussions.filter((d) => d.status === "pending").length,
      approved: discussions.filter((d) => d.status === "approved").length,
      flagged: discussions.filter((d) => d.status === "flagged").length,
    };
  }, [discussions]);
  const filteredDiscussions = discussions.filter((d) => {
    const matchFilter = activeFilter === "all" || d.status === activeFilter;
    const matchSearch =
      d.subject.toLowerCase().includes(search.toLowerCase()) ||
      d.student.toLowerCase().includes(search.toLowerCase()) ||
      d.courseName.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });
  const updateStatus = (id, status) => {
    const updated = discussions.map((d) =>
      d.id === id ? { ...d, status } : d,
    );
    setDiscussions(updated);
    localStorage.setItem("courseDiscussions", JSON.stringify(updated));
  };
  return (
    <div className="discussion-layout">
      <SidebarInstructor />
      <div className="discussion-page">
        <div className="discussion-header">
          <div>
            <h1>Discussion Moderation</h1>
            <p>Manage and moderate course discussions</p>
          </div>
          <button className="logout-btn">Logout</button>
        </div>
        <div className="discussion-stats">
          <div className="discussion-stat-card blue">
            <div className="stat-icon">
              <MessageSquare />
            </div>
            <div className="stat-content">
              <strong>{stats.total}</strong>
              <span>Total Discussions</span>
            </div>
          </div>
          <div className="discussion-stat-card yellow">
            <div className="stat-icon">
              <Clock />
            </div>
            <div className="stat-content">
              <strong>{stats.pending}</strong>
              <span>Pending Review</span>
            </div>
          </div>
          <div className="discussion-stat-card red">
            <div className="stat-icon">
              <AlertTriangle />
            </div>
            <div className="stat-content">
              <strong>{stats.flagged}</strong>
              <span>Flagged</span>
            </div>
          </div>
          <div className="discussion-stat-card green">
            <div className="stat-icon">
              <CheckCircle />
            </div>
            <div className="stat-content">
              <strong>{stats.approved}</strong>
              <span>Approved</span>
            </div>
          </div>
        </div>
        <div className="discussion-controls">
          <div className="discussion-search-box">
            <Search size={18} />
            <input
              placeholder="Search discussions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="discussion-filter-buttons">
            {["all", "approved", "pending", "flagged"].map((f) => (
              <button
                key={f}
                className={activeFilter === f ? `active ${f}` : ""}
                onClick={() => setActiveFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="discussion-list">
          {filteredDiscussions.length === 0 ? (
            <p>No discussions found</p>
          ) : (
            filteredDiscussions.map((d) => (
              <div key={d.id} className="discussion-card">
                <div className="discussion-info">
                  <h3>{d.subject}</h3>
                  <p className="meta">
                    <strong>{d.student}</strong> • {d.courseName}
                  </p>
                  <p className="message">{d.message}</p>
                  <p className="time">
                    {new Date(d.createdAt).toLocaleString()} • {d.replies}{" "}
                    replies
                  </p>
                </div>
                <div className="discussion-actions">
                  <button className="view">
                    <Eye size={16} /> View
                  </button>
                  {d.status === "pending" && (
                    <>
                      <button
                        className="approve"
                        onClick={() => updateStatus(d.id, "approved")}
                      >
                        <Check size={16} /> Approve
                      </button>
                      <button
                        className="reject"
                        onClick={() => updateStatus(d.id, "flagged")}
                      >
                        <X size={16} /> Reject
                      </button>
                    </>
                  )}
                  {d.status !== "flagged" && (
                    <button
                      className="flag"
                      onClick={() => updateStatus(d.id, "flagged")}
                    >
                      <Flag size={16} /> Flag
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
export default Discussion;
