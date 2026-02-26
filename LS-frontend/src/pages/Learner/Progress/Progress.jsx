import { useEffect, useMemo, useState } from "react";
import { getPublishedCourses } from "../../../services/courseApi";
import { getEnrollmentsByUser } from "../../../services/enrollmentApi";
import { buildCourseLearningState } from "../../../services/learnerProgressStore";
import "./Progress.scss";
import { getCurrentUser } from "../../../services/userProfileStore.js";

function Progress() {
  const currentUser = getCurrentUser();
  const userId = currentUser?.id || currentUser?.userId || "";

  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    if (!userId) return;

    let active = true;
    async function load() {
      try {
        const [published, mine] = await Promise.all([getPublishedCourses(0, 300), getEnrollmentsByUser(String(userId))]);
        if (!active) return;
        setCourses(Array.isArray(published) ? published : []);
        setEnrollments(Array.isArray(mine) ? mine : []);
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

    return enrollments
      .filter((item) => String(item.userId) === String(userId) && String(item.status || "").toUpperCase() === "ACTIVE")
      .map((entry) => {
        const course = courses.find((c) => String(c.id) === String(entry.courseId));
        if (!course) return null;

        const state = buildCourseLearningState(userId, course.id);

        let status = "Pending";
        if (state.progressPercentage > 0 && state.progressPercentage < 100) status = "In Progress";
        if (state.progressPercentage >= 100) status = "Completed";

        return {
          id: course.id,
          courseName: course.courseName,
          instructor: course.instructor || "Instructor",
          completedLessons: state.completedLessons,
          totalLessons: state.totalLessons,
          progress: state.progressPercentage,
          status,
        };
      })
      .filter(Boolean);
  }, [courses, enrollments, userId]);

  const totalCourses = progressData.length;
  const inProgressCourses = progressData.filter((item) => item.status === "In Progress").length;
  const completedCourses = progressData.filter((item) => item.status === "Completed").length;
  const avgProgress = totalCourses === 0 ? 0 : Math.floor(progressData.reduce((sum, item) => sum + item.progress, 0) / totalCourses);

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

              <div className={`status-tag ${course.status.toLowerCase().replace(" ", "-")}`}>{course.status}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Progress;

