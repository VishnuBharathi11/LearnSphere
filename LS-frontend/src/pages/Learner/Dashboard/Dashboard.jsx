import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LearnerImg from "../../../assets/learner/learner.jpg";
import courseImg from "../../../assets/Featured Courses/1.jpg";
import { getPublishedCourses } from "../../../services/courseApi";
import { getEnrollmentsByUser } from "../../../services/enrollmentApi";
import { buildCourseLearningState } from "../../../services/learnerProgressStore";
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

  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setEnrollments(Array.isArray(myEnrollments) ? myEnrollments : []);
        setCourses(Array.isArray(published) ? published : []);
      } catch {
        if (!active) return;
        setEnrollments([]);
        setCourses([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [navigate, userId]);

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
        const course = courses.find((item) => String(item.id) === String(enrollment.courseId));
        if (!course) return null;

        const state = buildCourseLearningState(userId, course.id);
        return {
          ...course,
          progress: state.progressPercentage,
        };
      })
      .filter(Boolean);
  }, [courses, myActiveEnrollments, userId]);

  const recommendedCourses = useMemo(() => {
    const myCourseIds = new Set(myActiveEnrollments.map((enrollment) => String(enrollment.courseId)));
    return courses.filter((course) => !myCourseIds.has(String(course.id))).slice(0, 5);
  }, [courses, myActiveEnrollments]);

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
            {loading ? (
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

          {loading ? (
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

