import { useEffect, useMemo, useState } from "react";
import { getPublishedCourses } from "../../../services/courseApi";
import { getEnrollmentsByCourses } from "../../../services/enrollmentApi";
import "./Progress.scss";

function Progress() {
  const currentUser = JSON.parse(window.appStore.getItem("currentUser") || "null");
  const userId = currentUser?.id || currentUser?.userId || "";

  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    if (!userId) return;

    let active = true;
    async function load() {
      try {
        const published = await getPublishedCourses(0, 300);
        if (!active) return;
        const safeCourses = Array.isArray(published) ? published : [];
        setCourses(safeCourses);

        const ids = safeCourses.map((course) => String(course.id));
        const list = await getEnrollmentsByCourses(ids);
        if (!active) return;
        setEnrollments(Array.isArray(list) ? list : []);
      } catch {
        if (!active) return;
        setCourses([]);
        setEnrollments([]);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [userId]);

  const progressData = useMemo(() => {
    if (!userId) return [];

    const localProgress = JSON.parse(window.appStore.getItem("enrolledCourses") || "[]");

    const myActive = enrollments.filter(
      (item) =>
        String(item.userId) === String(userId) &&
        String(item.status || "").toUpperCase() === "ACTIVE"
    );

    return myActive
      .map((entry) => {
        const course = courses.find((c) => String(c.id) === String(entry.courseId));
        if (!course) return null;

        const local = localProgress.find(
          (item) =>
            String(item.courseId) === String(course.id) &&
            String(item.studentId || item.userId) === String(userId)
        );

        const completed = Number(local?.completedLessons || 0);
        const total = Number(local?.totalLessons || course.lessons || 0);
        const progress = Number(local?.progress || (total === 0 ? 0 : Math.floor((completed / total) * 100)));

        let status = "Pending";
        if (progress > 0 && progress < 100) status = "In Progress";
        if (progress >= 100) status = "Completed";

        return {
          id: course.id,
          courseName: course.courseName,
          instructor: course.instructor || "Instructor",
          completedLessons: completed,
          totalLessons: total,
          progress,
          status,
        };
      })
      .filter(Boolean);
  }, [courses, enrollments, userId]);

  const totalCourses = progressData.length;
  const inProgressCourses = progressData.filter((item) => item.status === "In Progress").length;
  const completedCourses = progressData.filter((item) => item.status === "Completed").length;
  const avgProgress =
    totalCourses === 0
      ? 0
      : Math.floor(progressData.reduce((sum, item) => sum + item.progress, 0) / totalCourses);

  return (
    <div className="progress-container">
      <div className="progress-stats">
        <div className="progress-stat-card">
          <h3>{totalCourses}</h3>
          <p>Total Enrolled</p>
        </div>
        <div className="progress-stat-card">
          <h3>{inProgressCourses}</h3>
          <p>In Progress</p>
        </div>
        <div className="progress-stat-card">
          <h3>{completedCourses}</h3>
          <p>Completed</p>
        </div>
        <div className="progress-stat-card">
          <h3>{avgProgress}%</h3>
          <p>Average Progress</p>
        </div>
      </div>

      <div className="course-progress-section">
        <h3>Progress Per Course</h3>

        {progressData.length === 0 ? (
          <p>No learning activity yet</p>
        ) : (
          progressData.map((course) => (
            <div key={course.id} className="course-progress-card">
              <div className="course-left">
                <h4>{course.courseName}</h4>
                <p>{course.instructor}</p>

                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${course.progress}%` }} />
                </div>

                <span className="lesson-count">
                  {course.completedLessons} / {course.totalLessons} lessons completed
                </span>
              </div>

              <div className={`status-tag ${course.status.toLowerCase().replace(" ", "-")}`}>
                {course.status}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Progress;
