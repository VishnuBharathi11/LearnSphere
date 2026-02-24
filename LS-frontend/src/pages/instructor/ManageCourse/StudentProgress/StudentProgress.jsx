import React, { useEffect, useMemo, useState } from "react";
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
import { getCourseById } from "../../../../services/courseApi";
import { getEnrollmentsByCourse } from "../../../../services/enrollmentApi";

function StudentProgress() {
  const { courseId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const currentUser = JSON.parse(window.appStore.getItem("currentUser") || "null") || null;
  const currentRole = String(currentUser?.role || "").toLowerCase();
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    async function loadCourse() {
      try {
        const fetched = await getCourseById(String(courseId));
        if (String(fetched?.instructorId) === String(currentUser?.id)) {
          setSelectedCourse(fetched);
          const list = await getEnrollmentsByCourse(String(courseId));
          setEnrollments(Array.isArray(list) ? list : []);
        } else {
          setSelectedCourse(null);
          setEnrollments([]);
        }
      } catch {
        setSelectedCourse(null);
        setEnrollments([]);
      } finally {
        setLoadingCourse(false);
      }
    }
    loadCourse();
  }, [courseId, currentUser?.id]);

  const { course, students, avgProgress, activeCount, completedCount } = useMemo(() => {
    if (!selectedCourse) {
      return {
        course: null,
        students: [],
        avgProgress: 0,
        activeCount: 0,
        completedCount: 0,
      };
    }

    const students = enrollments.map((e) => {
      const normalizedStatus = String(e.status || "").toUpperCase();
      const status =
        normalizedStatus === "COMPLETED"
          ? "completed"
          : normalizedStatus === "ACTIVE"
            ? "active"
            : "inactive";
      return {
        id: e.id,
        name: `Learner #${e.userId}`,
        email: e.userId,
        progress: status === "completed" ? 100 : status === "active" ? 35 : 0,
        quizScore: "-",
        timeSpent: e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : "-",
        status,
      };
    });

    const avgProgress =
      students.length === 0
        ? 0
        : Math.round(students.reduce((sum, student) => sum + student.progress, 0) / students.length);

    return {
      course: selectedCourse,
      students,
      avgProgress,
      activeCount: students.filter((student) => student.status === "active").length,
      completedCount: students.filter((student) => student.status === "completed").length,
    };
  }, [selectedCourse, enrollments]);

  if (loadingCourse) {
    return <p style={{ padding: 40 }}>Loading course...</p>;
  }

  if (currentRole !== "instructor" || !course) {
    return <p style={{ padding: 40 }}>Unauthorized access.</p>;
  }

  const filtered = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(student.email).toLowerCase().includes(searchQuery.toLowerCase())
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
                filtered.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <strong>{student.name}</strong>
                      <br />
                      <small>{student.email}</small>
                    </td>
                    <td>{student.progress}%</td>
                    <td>{student.quizScore}</td>
                    <td>
                      <Clock size={14} /> {student.timeSpent}
                    </td>
                    <td>
                      <span className={`sp-status ${student.status}`}>{student.status}</span>
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
