import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import courseImg from "../../../assets/Featured Courses/1.jpg";
import { getCourseLessons, getPublishedCourses } from "../../../services/courseApi";
import { getEnrollmentsByUser } from "../../../services/enrollmentApi";
import { buildCourseLearningStateFromApi } from "../../../services/learnerProgressStore";
import { getProgressByCourses } from "../../../services/progressApi";
import "./MyCourses.scss";
import { getCurrentUser } from "../../../services/userProfileStore.js";

function MyCourses() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [lessonMap, setLessonMap] = useState({});
  const [progressMap, setProgressMap] = useState({});

  const currentUser = getCurrentUser();
  const userId = currentUser?.id || currentUser?.userId || "";

  useEffect(() => {
    if (!userId) {
      setCourses([]);
      setEnrollments([]);
      return;
    }

    let active = true;

    async function load() {
      try {
        const [published, mine] = await Promise.all([
          getPublishedCourses(0, 250),
          getEnrollmentsByUser(String(userId)),
        ]);
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

  useEffect(() => {
    let active = true;
    async function loadLessons() {
      if (!userId || enrollments.length === 0) {
        setLessonMap({});
        return;
      }
      const activeEnrollments = enrollments.filter(
        (enrollment) =>
          String(enrollment.userId) === String(userId) &&
          String(enrollment.status || "").toUpperCase() === "ACTIVE"
      );
      const courseIds = activeEnrollments.map((enrollment) => String(enrollment.courseId));
      try {
        const results = await Promise.all(
          courseIds.map(async (courseId) => {
            try {
              const lessons = await getCourseLessons(courseId);
              return [courseId, Array.isArray(lessons) ? lessons : []];
            } catch {
              return [courseId, []];
            }
          })
        );
        if (!active) return;
        const next = {};
        results.forEach(([courseId, lessons]) => {
          next[courseId] = lessons;
        });
        setLessonMap(next);
      } catch {
        if (!active) return;
        setLessonMap({});
      }
    }
    loadLessons();
    return () => {
      active = false;
    };
  }, [enrollments, userId]);

  useEffect(() => {
    let active = true;
    async function loadProgress() {
      if (!userId || enrollments.length === 0) {
        setProgressMap({});
        return;
      }
      const activeEnrollments = enrollments.filter(
        (enrollment) =>
          String(enrollment.userId) === String(userId) &&
          String(enrollment.status || "").toUpperCase() === "ACTIVE"
      );
      const courseIds = activeEnrollments.map((enrollment) => String(enrollment.courseId));
      try {
        const results = await getProgressByCourses(userId, courseIds);
        if (!active) return;
        const next = {};
        (Array.isArray(results) ? results : []).forEach((item) => {
          next[String(item.courseId)] = item;
        });
        setProgressMap(next);
      } catch {
        if (!active) return;
        setProgressMap({});
      }
    }
    loadProgress();
    return () => {
      active = false;
    };
  }, [enrollments, userId]);

  const myCourses = useMemo(() => {
    const backendActive = enrollments.filter(
      (enrollment) =>
        String(enrollment.userId) === String(userId) &&
        String(enrollment.status || "").toUpperCase() === "ACTIVE"
    );

    return backendActive
      .map((enrollment) => {
        const course = courses.find((item) => String(item.id) === String(enrollment.courseId));
        if (!course) return null;

        const lessons = lessonMap[String(course.id)] || [];
        const progress = progressMap[String(course.id)] || null;
        const state = buildCourseLearningStateFromApi(lessons, progress);
        return {
          ...course,
          completedLessons: state.completedLessons,
          totalLessons: state.totalLessons,
          progress: state.progressPercentage,
          certificateUnlocked: state.certificateUnlocked,
        };
      })
      .filter(Boolean);
  }, [courses, enrollments, lessonMap, progressMap, userId]);

  const coursesToShow = myCourses.filter((course) => {
    if (activeTab === "pending") return course.progress < 100;
    if (activeTab === "completed") return course.progress === 100;
    return true;
  });

  return (
    <div className="mycourses-container">
      <div className="tabs">
        <button className={activeTab === "all" ? "active" : ""} onClick={() => setActiveTab("all")}>
          All
        </button>
        <button className={activeTab === "pending" ? "active" : ""} onClick={() => setActiveTab("pending")}>
          Pending
        </button>
        <button className={activeTab === "completed" ? "active" : ""} onClick={() => setActiveTab("completed")}>
          Completed
        </button>
      </div>

      <div className="mycourse-grid">
        {coursesToShow.length === 0 ? (
          <p className="empty-text">No courses found</p>
        ) : (
          coursesToShow.map((course) => (
            <div className="mycourse-card" key={course.id}>
              <img
                src={course.thumbnail || courseImg}
                alt={course.courseName}
                className="mycourse-img"
                loading="lazy"
                decoding="async"
              />
              <div className="mycourse-title">{course.courseName}</div>
              <div className="mycourse-instructor">{course.instructor || "Instructor"}</div>
              <div className="mycourse-progress-text">Progress: {course.progress}%</div>
              <div className="mycourse-progress-track">
                <div className="mycourse-progress-fill" style={{ width: `${course.progress}%` }} />
              </div>
              <button
                className="mycourse-btn"
                onClick={() => {
                  if (course.certificateUnlocked) {
                    navigate(`/student-layout/download-certificate/${course.id}`);
                  } else {
                    navigate(`/student-layout/learn/${course.id}`);
                  }
                }}
              >
                {course.certificateUnlocked ? "Download Certificate" : "Continue Learning"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MyCourses;

