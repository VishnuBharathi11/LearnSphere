import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Search,
  Download,
  TrendingUp,
  Award,
  Users,
  CheckCircle,
  Clock,
  Sidebar,
} from "lucide-react";
import "./StudentProgress.css";
import SidebarInstructor from "../../../../components/SideBar-I/SidebarInstructor";
function StudentProgress() {
  const { courseId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const students = [
    {
      id: 1,
      name: "Rahul Sharma",
      email: "rahul@gmail.com",
      progress: 85,
      quizScore: "34/40",
      timeSpent: "45h",
      status: "active",
    },
    {
      id: 2,
      name: "Priya Patel",
      email: "priya@gmail.com",
      progress: 95,
      quizScore: "40/40",
      timeSpent: "52h",
      status: "completed",
    },
    {
      id: 3,
      name: "Amit Kumar",
      email: "amit@gmail.com",
      progress: 60,
      quizScore: "18/40",
      timeSpent: "22h",
      status: "inactive",
    },
  ];
  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const stats = {
    avgProgress: Math.round(
      students.reduce((a, b) => a + b.progress, 0) / students.length,
    ),
    active: students.filter((s) => s.status === "active").length,
    completed: students.filter((s) => s.status === "completed").length,
  };
  return (
    <div className="student-progress-layout">
        <SidebarInstructor/>
        <div className="student-progress-page">
      <div className="sp-page-header">
        <div>
          <h1>Student Progress</h1>
          <p>Course ID: {courseId}</p>
        </div>
        <button className="export-btn">
          <Download size={16} /> Export
        </button>
      </div>
      <div className="sp-stats-grid">
        <div className="sp-stat-card">
          <TrendingUp />
          <span>Avg Progress</span>
          <strong>{stats.avgProgress}%</strong>
        </div>
        <div className="sp-stat-card">
          <Users />
          <span>Active</span>
          <strong>{stats.active}</strong>
        </div>
        <div className="sp-stat-card">
          <CheckCircle />
          <span>Completed</span>
          <strong>{stats.completed}</strong>
        </div>
      </div>
      <div className="sp-search-box">
        <Search size={16} />
        <input
          placeholder="Search student..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Progress</th>
              <th>Quiz</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td>
                  <strong>{s.name}</strong>
                  <br />
                  <small>{s.email}</small>
                </td>
                <td>{s.progress}%</td>
                <td>{s.quizScore}</td>
                <td>
                  <Clock size={14} /> {s.timeSpent}
                </td>
                <td>
                  <span className={`sp-status ${s.status}`}>{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}

export default StudentProgress;
