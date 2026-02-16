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
function Discussion() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
  const allCourses = JSON.parse(localStorage.getItem("courses")) || [];
  const instructorCourses = allCourses.filter((c) => c.instructorId === currentUser.id);
  const instructorCourseIds=instructorCourses.map((c)=>c.id);

  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [discussions, setDiscussions] = useState(() => {
    const stored= JSON.parse(localStorage.getItem("courseDiscussions")) || [];
    return stored.filter((d)=>instructorCourseIds.includes(d.courseId));
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
    const all = JSON.parse(localStorage.getItem("courseDiscussions")) || [];
    const updatedAll =all.map((d)=>d.id===id?{...d,status,updatedAt:new Date().toISOString()}:d);
    localStorage.setItem("courseDiscussions", JSON.stringify(updatedAll));
    setDiscussions(updatedAll.filter((d)=>instructorCourseIds.includes(d.courseId)));
  };
  if(currentUser.role!=="instructor"){
    return <p style={{ padding: 40 }}>Unauthorized access</p>;
  }
  return (
    <div className="discussion-layout">
      <div className="discussion-page">
        <div className="discussion-stats">
          <Stat icon={MessageSquare} label="Total Discussions" value={stats.total} color="blue" />
          <Stat icon={Clock} label="Pending Review" value={stats.pending} color="yellow" />
          <Stat icon={AlertTriangle} label="Flagged" value={stats.flagged} color="red" />
          <Stat icon={CheckCircle} label="Approved" value={stats.approved} color="green" />
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
                    {new Date(d.createdAt).toLocaleString()} • {d.replies||0}{" "}
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
function Stat({ icon, label, value, color }) {
  const Icon=icon;
  return (
    <div className={`discussion-stat-card ${color}`}>
      <div className="stat-icon">
        <Icon />
      </div>
      <div className="stat-content">
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}
export default Discussion;
