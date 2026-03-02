import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LearnerImg from "../../../assets/learner/learner.jpg";
import courseImg from "../../../assets/Featured Courses/1.jpg";
import {  getCourseLessons,
  getCoursesByIds,
  getPublishedCourses,
} from "../../../services/courseApi";
import { getEnrollmentsByUser } from "../../../services/enrollmentApi";
import { buildCourseLearningStateFromApi } from "../../../services/learnerProgressStore";
import { getProgressByCourses } from "../../../services/progressApi";
import "./Dashboard.scss";
import { getCurrentUser } from "../../../services/userProfileStore.js";

function Dashboard() {
  const navigate = useNavigate();
  const currentUser = useMemo(() => {
    try {
      return getCurrentUser();
    } catch {
      return null;
    }
  }, []);
  const userId = currentUser?.id || currentUser?.userId || "";

  const [publishedCourses, setPublishedCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [lessonMap, setLessonMap] = useState({});
  const [progressMap, setProgressMap] = useState({});

  useEffect(() => {
    if (!userId) {
      navigate("/login", { replace: true });
      return;
    }

    let active = true;
    async function load() {
      setLoading(true);
      try {
        const [myEnrollments, published] = await Promise.all([
          getEnrollmentsByUser(String(userId)),
          getPublishedCourses(0, 120),
        ]);

        if (!active) return;
        const safeEnrollments = Array.isArray(myEnrollments) ? myEnrollments : [];
        setEnrollments(safeEnrollments);
        setPublishedCourses(Array.isArray(published) ? published : []);

        const activeCourseIds = safeEnrollments
          .filter(
            (enrollment) =>
              String(enrollment.userId) === String(userId) &&
              String(enrollment.status || "").toUpperCase() === "ACTIVE"
          )
          .map((item) => String(item.courseId));

        const enrolled = await getCoursesByIds(activeCourseIds);
        if (!active) return;
        setEnrolledCourses(Array.isArray(enrolled) ? enrolled : []);
      } catch {
        if (!active) return;
        setEnrollments([]);
        setPublishedCourses([]);
        setEnrolledCourses([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [navigate, userId]);

  useEffect(() => {
    let active = true;
    async function loadLessonsAndProgress() {
      setDetailsLoading(true);
      const activeEnrollments = enrollments.filter(
        (enrollment) =>
          String(enrollment.userId) === String(userId) &&
          String(enrollment.status || "").toUpperCase() === "ACTIVE"
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

  const myActiveEnrollments = useMemo(
    () =>
      enrollments.filter(
        (enrollment) =>
          String(enrollment.userId) === String(userId) &&
          String(enrollment.status || "").toUpperCase() === "ACTIVE"
      ),
    [enrollments, userId]
  );

  const continueCourses = useMemo(() => {
    return myActiveEnrollments
      .map((enrollment) => {
        const course = enrolledCourses.find((item) => String(item.id) === String(enrollment.courseId));
        if (!course) return null;

        const lessons = lessonMap[String(course.id)] || [];
        const progress = progressMap[String(course.id)] || null;
        const state = buildCourseLearningStateFromApi(lessons, progress);
        return {
          ...course,
          progress: state.progressPercentage,
        };
      })
      .filter(Boolean);
  }, [enrolledCourses, lessonMap, myActiveEnrollments, progressMap]);

  const recommendedCourses = useMemo(() => {
    const myCourseIds = new Set(myActiveEnrollments.map((enrollment) => String(enrollment.courseId)));
    return publishedCourses.filter((course) => !myCourseIds.has(String(course.id))).slice(0, 5);
  }, [publishedCourses, myActiveEnrollments]);

  const isPageLoading = loading || detailsLoading;

  return (
    <div className="dashboard-container">
      <div className="welcome-row">
        <div className="welcome-card">
          <div>
            <h2>Welcome Back, {currentUser?.username || currentUser?.name || "Learner"}</h2>
            <p>
              Keep learning and improve your skills.{" "}
              {continueCourses.length > 0
                ? `You are enrolled in ${continueCourses.length} course(s).`
                : "No enrolled courses yet."}
            </p>
            {continueCourses.length > 0 ? (
              <button className="primary-btn" onClick={() => navigate(`/student-layout/learn/${continueCourses[0].id}`)}>
                Continue Learning
              </button>
            ) : (
              <button className="primary-btn" onClick={() => navigate("/courses")}>
                Browse Courses
              </button>
            )}
          </div>
          <img src={LearnerImg} alt="learning" className="welcome-img" />
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="continue-section">
          <h3>Continue Learning</h3>
          <div className="course-grid">
            {isPageLoading ? (
              <p>Loading courses...</p>
            ) : continueCourses.length === 0 ? (
              <p>No courses in progress</p>
            ) : (
              continueCourses.map((course) => (
                <div
                  className="course-card"
                  key={course.id}
                  onClick={() => navigate(`/student-layout/learn/${course.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="course-cont">
                    <img
                      src={course.thumbnail || courseImg}
                      alt={course.courseName}
                      className="cont-learn-img"
                      loading="lazy"
                      decoding="async"
                    />
                    <div>
                      <h4>{course.courseName}</h4>
                      <p>{course.instructor || "Instructor"}</p>
                    </div>
                  </div>
                  <div className="course-footer">
                    <span className="link">Resume</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${course.progress}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="recommended-section">
          <h3>Recommended Courses</h3>

          {isPageLoading ? (
            <p>Loading recommendations...</p>
          ) : recommendedCourses.length === 0 ? (
            <p>No recommendations available</p>
          ) : (
            recommendedCourses.map((course) => (
              <div
                className="recommend-card"
                key={course.id}
                onClick={() => navigate(`/course/${course.id}`)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={course.thumbnail || courseImg}
                  alt={course.title}
                  loading="lazy"
                  decoding="async"
                />
                <div>
                  <h4>{course.courseName}</h4>
                  <p>Rating {course.rating}</p>
                  <span>{Number(course.price || 0) > 0 ? `Rs ${course.price}` : "Free"}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

