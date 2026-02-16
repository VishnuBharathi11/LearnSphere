import React, {useMemo, useState } from "react";
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
  const { course,students, avgProgress, activeCount, completedCount } = useMemo(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
    const allCourses = JSON.parse(localStorage.getItem("courses")) || [];
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const enrolled = JSON.parse(localStorage.getItem("enrolledCourses")) || [];
    const testResults = JSON.parse(localStorage.getItem("testResults")) || [];
    const lessonMap = JSON.parse(localStorage.getItem("courseLessons")) || {};

    const course=allCourses.find((c)=>String(c.id)===String(courseId)&&c.instructorId===currentUser?.id);
    if (!course) {
      return {
        course: null,
        students: [],
        avgProgress: 0,
        activeCount: 0,
        completedCount: 0,
      };
    }

    const totalLessons=(lessonMap[courseId]||[]).length;
    const courseEnrollments = enrolled.filter(
      (e) => String(e.courseId) === courseId,
    );

    const students = courseEnrollments.map((e) => {
      const user=users.find((u)=>u.id===e.studentId);
      const completed=e.completedLessons||0;
      const progress =totalLessons===0?0: Math.floor((completed /totalLessons) * 100);

      const result = testResults.find(
        (r) => String(r.courseId) === String(courseId) && r.studentId === e.studentId,
      );
      let status = "inactive";
      if(progress>0&&progress<100)
        status="active";
      if(progress===100)
        status="completed"
      return {
        id: e.studentId,
        name: user?.name || "Unknown Student",
        email: user?.email || "N/A",
        progress,
        quizScore: result ? `${result.score}/${result.total}` : "—",
        timeSpent: `${completed*10}min`,
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
      course,
      students,
      avgProgress,
      activeCount,
      completedCount,
    };
  }, [courseId]);
  if (!course) {
    return <p style={{ padding: 40 }}>Unauthorized access.</p>;
  }
  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  return (
    <div className="student-progress-layout">
      <div className="student-progress-page">
        <div className="sp-page-header">
          <p>{course.courseName}</p>
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
