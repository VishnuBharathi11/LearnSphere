import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LearnerImg from "../../../assets/learner/learner.jpg";
import courseImg from "../../../assets/Featured Courses/1.jpg";
import { getPublishedCourses } from "../../../services/courseApi";
import { getEnrollmentsByCourses } from "../../../services/enrollmentApi";
import "./Dashboard.scss";

function Dashboard() {
  const CATEGORY_IMAGES = {
    "Web Development": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
    "UI/UX Design": "https://images.unsplash.com/photo-1545235617-9465d2a55698",
    "Data Science": "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
    "Mobile Development": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
    "Artificial Intelligence": "https://images.unsplash.com/photo-1531746790731-6c087fecd65a",
    "Cybersecurity": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
    "Cloud Computing": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8",
    DevOps: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    Blockchain: "https://images.unsplash.com/photo-1621761191319-c6fb62004040",
    "Software Engineering": "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  };

  const navigate = useNavigate();
  const currentUser = JSON.parse(window.appStore.getItem("currentUser") || "null");
  const userId = currentUser?.id || currentUser?.userId || "";

  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login", { replace: true });
      return;
    }

    let active = true;
    async function load() {
      try {
        const published = await getPublishedCourses(0, 200);
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
  }, [currentUser, navigate]);

  const myActiveEnrollments = useMemo(() => {
    return enrollments.filter(
      (enrollment) =>
        String(enrollment.userId) === String(userId) &&
        String(enrollment.status || "").toUpperCase() === "ACTIVE"
    );
  }, [enrollments, userId]);

  const continueCourses = useMemo(() => {
    return myActiveEnrollments
      .map((enrollment) => {
        const course = courses.find((item) => String(item.id) === String(enrollment.courseId));
        if (!course) return null;
        return {
          ...course,
          progress: 10,
        };
      })
      .filter(Boolean);
  }, [myActiveEnrollments, courses]);

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
              Keep learning and improve your skills.
              {" "}
              {continueCourses.length > 0
                ? `You are enrolled in ${continueCourses.length} course(s).`
                : "No enrolled courses yet."}
            </p>
            {continueCourses.length > 0 && (
              <button
                className="primary-btn"
                onClick={() => navigate(`/student-layout/learn/${continueCourses[0].id}`)}
              >
                Continue Learning
              </button>
            )}
            {continueCourses.length === 0 && (
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
            {continueCourses.length === 0 ? (
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
                      src={CATEGORY_IMAGES[course.category] || courseImg}
                      alt={course.courseName}
                      className="cont-learn-img"
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

          {recommendedCourses.length === 0 ? (
            <p>No recommendations available</p>
          ) : (
            recommendedCourses.map((course) => (
              <div
                className="recommend-card"
                key={course.id}
                onClick={() => navigate(`/course/${course.id}`)}
                style={{ cursor: "pointer" }}
              >
                <img src={CATEGORY_IMAGES[course.category] || courseImg} alt={course.title} />
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
