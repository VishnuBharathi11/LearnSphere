import { useMemo } from "react";
import { courses } from "../../../data/courses";
import "./Progress.scss";

function Progress() {
  const progressData = useMemo(() => {
    const enrolled =
      JSON.parse(localStorage.getItem("enrolledCourses")) || [];

    return enrolled
      .map(ec => {
        const course = courses.find(c => c.id === ec.courseId);
        if (!course) return null;

        const completed = ec.completedLessons || 0;
        const total = ec.totalLessons || course.lessons;

        const progress = Math.floor(
          (completed / total) * 100
        );

        let status = "Pending";
        if (progress > 0 && progress < 100) status = "In Progress";
        if (progress === 100) status = "Completed";

        return {
          id: course.id,
          courseName: course.courseName,
          instructor: course.instructor,
          completedLessons: completed,
          totalLessons: total,
          progress,
          status
        };
      })
      .filter(Boolean);
  }, []);

  const totalCourses = progressData.length;
  const inProgressCourses = progressData.filter(
    c => c.status === "In Progress"
  ).length;
  const completedCourses = progressData.filter(
    c => c.status === "Completed"
  ).length;

  const avgProgress =
    totalCourses === 0
      ? 0
      : Math.floor(
          progressData.reduce(
            (sum, c) => sum + c.progress,
            0
          ) / totalCourses
        );

  return (
    <div className="progress-container">
      <div className="progress-stats">
        <div className="progress-stat-card">
          <h3>{totalCourses}</h3>
          <p>Total Courses</p>
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
      <div className="progress-graph-card">
        <h3>Overall Progress</h3>

        <div className="graph-track">
          <div
            className="graph-fill"
            style={{ width: `${avgProgress}%` }}
          />
        </div>

        <p className="graph-label">
          Average completion across all enrolled courses
        </p>
      </div>
      <div className="course-progress-section">
        <h3>Course Progress</h3>

        {progressData.length === 0 ? (
          <p>No learning activity yet</p>
        ) : (
          progressData.map(course => (
            <div
              key={course.id}
              className="course-progress-card"
            >
              <div className="course-left">
                <h4>{course.courseName}</h4>
                <p>{course.instructor}</p>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${course.progress}%`
                    }}
                  />
                </div>

                <span className="lesson-count">
                  {course.completedLessons} /{" "}
                  {course.totalLessons} lessons completed
                </span>
              </div>

              <div
                className={`status-tag ${course.status
                  .toLowerCase()
                  .replace(" ", "-")}`}
              >
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
