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
import { getCourseById, getCourseLessons } from "../../../../services/courseApi";
import { getEnrollmentsByCourse } from "../../../../services/enrollmentApi";
import { getAdminUsers } from "../../../../services/adminApi";
import { getCourseProgress } from "../../../../services/progressApi";
import { getCurrentUser } from "../../../../services/userProfileStore.js";

function StudentProgress() {
  const { courseId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const currentUser = getCurrentUser() || null;
  const currentRole = String(currentUser?.role || "").toLowerCase();
  const [enrollments, setEnrollments] = useState([]);
  const [userDirectory, setUserDirectory] = useState({});
  const [courseLessons, setCourseLessons] = useState([]);
  const [progressByUser, setProgressByUser] = useState({});

  useEffect(() => {
    async function loadCourse() {
      try {
        const fetched = await getCourseById(String(courseId));
        if (String(fetched?.instructorId) === String(currentUser?.id)) {
          setSelectedCourse(fetched);
          const [list, users] = await Promise.all([
            getEnrollmentsByCourse(String(courseId)),
            getAdminUsers().catch(() => []),
          ]);
          const lessons = await getCourseLessons(String(courseId)).catch(() => []);
          setEnrollments(Array.isArray(list) ? list : []);
          setCourseLessons(Array.isArray(lessons) ? lessons : []);
          const userMap = Object.fromEntries(
            (Array.isArray(users) ? users : [])
              .filter((entry) => entry && entry.id !== undefined && entry.id !== null)
              .map((entry) => [String(entry.id), entry])
          );
          setUserDirectory(userMap);
        } else {
          setSelectedCourse(null);
          setEnrollments([]);
          setCourseLessons([]);
          setUserDirectory({});
        }
      } catch {
        setSelectedCourse(null);
        setEnrollments([]);
        setCourseLessons([]);
        setUserDirectory({});
      } finally {
        setLoadingCourse(false);
      }
    }
    loadCourse();
  }, [courseId, currentUser?.id]);

  useEffect(() => {
    if (!courseId || enrollments.length === 0) {
      setProgressByUser({});
      return;
    }

    let active = true;
    async function loadProgress() {
      try {
        const responses = await Promise.all(
          enrollments.map(async (enrollment) => {
            const userId = String(enrollment.userId || "");
            if (!userId) return [userId, null];
            const data = await getCourseProgress(userId, String(courseId)).catch(() => null);
            return [userId, data];
          })
        );

        if (!active) return;
        setProgressByUser(Object.fromEntries(responses.filter(([userId]) => Boolean(userId))));
      } catch {
        if (!active) return;
        setProgressByUser({});
      }
    }

    loadProgress();
    return () => {
      active = false;
    };
  }, [courseId, enrollments]);

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
      const user = userDirectory[String(e.userId)] || null;
      const displayName = String(user?.name || "").trim() || `Learner #${e.userId}`;
      const displayEmail = String(user?.email || "").trim() || String(e.userId || "-");
      const progressEntry = progressByUser[String(e.userId)] || null;
      const totalLessons = Math.max(1, courseLessons.length);
      const completedLessons = Array.isArray(progressEntry?.completedLessonIds)
        ? progressEntry.completedLessonIds.length
        : 0;
      const progressPercent = Math.min(100, Math.round((completedLessons / totalLessons) * 100));
      const status = progressPercent >= 100 ? "completed" : "in-progress";
      const quizScore =
        Number.isFinite(progressEntry?.finalAssessment?.score) &&
        Number.isFinite(progressEntry?.finalAssessment?.total)
          ? `${progressEntry.finalAssessment.score}/${progressEntry.finalAssessment.total}`
          : "-";
      return {
        id: e.id,
        name: displayName,
        email: displayEmail,
        progress: status === "completed" ? 100 : progressPercent,
        quizScore,
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
      activeCount: students.filter((student) => student.status === "in-progress").length,
      completedCount: students.filter((student) => student.status === "completed").length,
    };
  }, [selectedCourse, enrollments, userDirectory, progressByUser, courseLessons.length]);

  const exportAsPdf = () => {
    const rows = students
      .map(
        (student, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.progress}%</td>
            <td>${student.quizScore}</td>
            <td>${student.timeSpent}</td>
            <td>${student.status}</td>
          </tr>
        `
      )
      .join("");

    const popup = window.open("", "_blank", "width=1000,height=800");
    if (!popup) return;

    popup.document.write(`
      <html>
        <head>
          <title>${course?.courseName || "Course"} - Student Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1 { margin: 0 0 6px; font-size: 22px; }
            p { margin: 0 0 14px; color: #4b5563; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #d1d5db; padding: 8px; font-size: 12px; text-align: left; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>${course?.courseName || "Course"} - Students Report</h1>
          <p>Generated on ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Progress</th>
                <th>Quiz</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  if (loadingCourse) {
    return null;
  }

  if (currentRole !== "instructor" || !course) {
    return (
      <p style={{ padding: 40 }}>
        Access denied. Student progress can be viewed only by the course instructor.
      </p>
    );
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
          <div className="header-left">
            <h2 className="sp-title">Student Progress Tracker</h2>
            <p className="course-pill">{course.courseName}</p>
          </div>
          <button className="export-btn" onClick={exportAsPdf}>
            <Download size={16} /> Export PDF
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
            <span>In Progress</span>
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

