import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Search,
  Download,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
} from "lucide-react";
import "./StudentProgress.scss";

function StudentProgress() {
  const { courseId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const { students, avgProgress, activeCount, completedCount } = useMemo(() => {
    const enrolled = JSON.parse(localStorage.getItem("enrolledCourses")) || [];
    const testResults = JSON.parse(localStorage.getItem("testResults")) || [];
    const courseEnrollments = enrolled.filter(
      (e) => String(e.courseId) === courseId,
    );
    const studentDirectory = {
      101: { name: "Rahul Sharma", email: "rahul@gmail.com" },
      102: { name: "Priya Patel", email: "priya@gmail.com" },
      103: { name: "Amit Kumar", email: "amit@gmail.com" },
    };
    const students = courseEnrollments.map((e) => {
      const progress = Math.floor((e.completedLessons / e.totalLessons) * 100);
      const result = testResults.find(
        (r) => String(r.courseId) === courseId && r.studentId === e.studentId,
      );
      let status = "active";
      if (progress === 100) status = "completed";
      if (progress === 0) status = "inactive";
      return {
        id: e.studentId,
        name: studentDirectory[e.studentId]?.name || "Unknown Student",
        email: studentDirectory[e.studentId]?.email || "N/A",
        progress,
        quizScore: result ? `${result.score}/${result.total}` : "—",
        timeSpent: `${e.completedLessons * 2}h`,
        status,
      };
    });
    const avgProgress =
      students.length === 0
        ? 0
        : Math.round(
            students.reduce((sum, s) => sum + s.progress, 0) / students.length,
          );
    const activeCount = students.filter((s) => s.status === "active").length;
    const completedCount = students.filter(
      (s) => s.status === "completed",
    ).length;
    return {
      students,
      avgProgress,
      activeCount,
      completedCount,
    };
  }, [courseId]);
  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  return (
    <div className="student-progress-layout">
      <div className="student-progress-page">
        <div className="sp-page-header">
            <p>Course ID: {courseId}</p>
          <button className="export-btn">
            <Download size={16} /> Export
          </button>
        </div>
        <div className="sp-stats-grid">
          <div className="sp-stat-card">
            <TrendingUp />
            <span>Avg Progress</span>
            <strong>{avgProgress}%</strong>
          </div>
          <div className="sp-stat-card">
            <Users />
            <span>Active</span>
            <strong>{activeCount}</strong>
          </div>
          <div className="sp-stat-card">
            <CheckCircle />
            <span>Completed</span>
            <strong>{completedCount}</strong>
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5">No students found</td>
                </tr>
              ) : (
                filtered.map((s) => (
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
                      <span className={`sp-status ${s.status}`}>
                        {s.status}
                      </span>
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

export default StudentProgress;
