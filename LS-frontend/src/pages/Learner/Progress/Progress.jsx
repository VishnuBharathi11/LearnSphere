import { useEffect, useMemo, useState } from "react";
import { getCourseLessons, getCoursesByIds } from "../../../services/courseApi";
import { getEnrollmentsByUser } from "../../../services/enrollmentApi";
import { buildCourseLearningStateFromApi } from "../../../services/learnerProgressStore";
import { getProgressByCourses } from "../../../services/progressApi";
import "./Progress.scss";
import { getCurrentUser } from "../../../services/userProfileStore.js";

function Progress() {
  const currentUser = getCurrentUser();
  const userId = currentUser?.id || currentUser?.userId || "";

  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [lessonMap, setLessonMap] = useState({});
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    let active = true;
    async function load() {
      setLoading(true);
      try {
        const mine = await getEnrollmentsByUser(String(userId));
        if (!active) return;
        const safeEnrollments = Array.isArray(mine) ? mine : [];
        setEnrollments(safeEnrollments);

        const activeCourseIds = safeEnrollments
          .filter(
            (item) => String(item.userId) === String(userId) && String(item.status || "").toUpperCase() === "ACTIVE"
          )
          .map((item) => String(item.courseId));
        const enrolledCourses = await getCoursesByIds(activeCourseIds);
        if (!active) return;
        setCourses(Array.isArray(enrolledCourses) ? enrolledCourses : []);
      } catch {
        if (!active) return;
        setCourses([]);
        setEnrollments([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    let active = true;
    async function loadLessonsAndProgress() {
      setDetailsLoading(true);
      const activeEnrollments = enrollments.filter(
        (item) => String(item.userId) === String(userId) && String(item.status || "").toUpperCase() === "ACTIVE"
      );
      const courseIds = activeEnrollments.map((item) => String(item.courseId));
      if (courseIds.length === 0) {
        setLessonMap({});
        setProgressMap({});
        setDetailsLoading(false);
        return;
      }
      try {
        const [lessonsList, progressList] = await Promise.all([
          Promise.all(
            courseIds.map(async (courseId) => {
              try {
                const lessons = await getCourseLessons(courseId);
                return [courseId, Array.isArray(lessons) ? lessons : []];
              } catch {
                return [courseId, []];
              }
            })
          ),
          getProgressByCourses(userId, courseIds),
        ]);
        if (!active) return;
        const nextLessons = {};
        lessonsList.forEach(([courseId, lessons]) => {
          nextLessons[courseId] = lessons;
        });
        const nextProgress = {};
        (Array.isArray(progressList) ? progressList : []).forEach((item) => {
          nextProgress[String(item.courseId)] = item;
        });
        setLessonMap(nextLessons);
        setProgressMap(nextProgress);
      } catch {
        if (!active) return;
        setLessonMap({});
        setProgressMap({});
      } finally {
        if (active) setDetailsLoading(false);
      }
    }
    loadLessonsAndProgress();
    return () => {
      active = false;
    };
  }, [enrollments, userId]);

  const progressData = useMemo(() => {
    if (!userId) return [];

    return enrollments
      .filter((item) => String(item.userId) === String(userId) && String(item.status || "").toUpperCase() === "ACTIVE")
      .map((entry) => {
        const course = courses.find((c) => String(c.id) === String(entry.courseId));
        if (!course) return null;

        const lessons = lessonMap[String(course.id)] || [];
        const progress = progressMap[String(course.id)] || null;
        const state = buildCourseLearningStateFromApi(lessons, progress);

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
  }, [courses, enrollments, lessonMap, progressMap, userId]);

  const totalCourses = progressData.length;
  const inProgressCourses = progressData.filter((item) => item.status === "In Progress").length;
  const completedCourses = progressData.filter((item) => item.status === "Completed").length;
  const avgProgress = totalCourses === 0 ? 0 : Math.floor(progressData.reduce((sum, item) => sum + item.progress, 0) / totalCourses);
  const isPageLoading = loading || detailsLoading;

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

        {isPageLoading ? (
          <p>Loading progress...</p>
        ) : progressData.length === 0 ? (
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

