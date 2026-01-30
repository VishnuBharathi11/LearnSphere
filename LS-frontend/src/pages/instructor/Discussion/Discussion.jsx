import React, { useState } from "react";
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

  const discussions = [
    {
      id: 1,
      student: "John Doe",
      course: "React Development",
      subject: "Hooks confusion",
      message: "Difference between useEffect and useLayoutEffect?",
      status: "pending",
      time: "2 hours ago",
      replies: 0,
    },
    {
      id: 2,
      student: "Sarah Smith",
      course: "AI & Deep Learning",
      subject: "Backpropagation doubt",
      message: "Can you explain step 3 again?",
      status: "approved",
      time: "5 hours ago",
      replies: 3,
    },
    {
      id: 3,
      student: "Mike Johnson",
      course: "React Development",
      subject: "Inappropriate content reported",
      message: "Spam content detected",
      status: "flagged",
      time: "1 day ago",
      replies: 1,
    },
    {
      id: 4,
      student: "Emily Brown",
      course: "Python for Data Science",
      subject: "DataFrame merge issue",
      message: "Best practice to merge dataframes?",
      status: "approved",
      time: "3 hours ago",
      replies: 5,
    },
    {
      id: 5,
      student: "David Lee",
      course: "AI & Deep Learning",
      subject: "Assignment upload error",
      message: "Submission not working",
      status: "pending",
      time: "6 hours ago",
      replies: 0,
    },
  ];

  const stats = {
    total: discussions.length,
    pending: discussions.filter((d) => d.status === "pending").length,
    approved: discussions.filter((d) => d.status === "approved").length,
    flagged: discussions.filter((d) => d.status === "flagged").length,
  };

  const filteredDiscussions = discussions.filter((d) => {
    const matchFilter = activeFilter === "all" || d.status === activeFilter;
    const matchSearch =
      d.subject.toLowerCase().includes(search.toLowerCase()) ||
      d.student.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

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
            <button
              className={activeFilter === "all" ? "active" : ""}
              onClick={() => setActiveFilter("all")}
            >
              All
            </button>
            <button
              className={activeFilter === "approved" ? "active approved" : ""}
              onClick={() => setActiveFilter("approved")}
            >
              Approved
            </button>
            <button
              className={activeFilter === "pending" ? "active pending" : ""}
              onClick={() => setActiveFilter("pending")}
            >
              Pending
            </button>
            <button
              className={activeFilter === "flagged" ? "active flagged" : ""}
              onClick={() => setActiveFilter("flagged")}
            >
              Flagged
            </button>
          </div>
        </div>
        <div className="discussion-list">
          {filteredDiscussions.map((d) => (
            <div key={d.id} className="discussion-card">
              <div className="discussion-info">
                <h3>{d.subject}</h3>
                <p className="meta">
                  <strong>{d.student}</strong> • {d.course}
                </p>
                <p className="message">{d.message}</p>
                <p className="time">
                  {d.time} • {d.replies} replies
                </p>
              </div>
              <div className="discussion-actions">
                <button className="view">
                  <Eye size={16} /> View
                </button>
                {d.status === "pending" && (
                  <>
                    <button className="approve">
                      <Check size={16} /> Approve
                    </button>
                    <button className="reject">
                      <X size={16} /> Reject
                    </button>
                  </>
                )}
                {d.status !== "flagged" && (
                  <button className="flag">
                    <Flag size={16} /> Flag
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Discussion;
