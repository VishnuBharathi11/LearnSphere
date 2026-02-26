import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import courseImg from "../../../assets/Featured Courses/1.jpg";
import { getPublishedCourses } from "../../../services/courseApi";
import { getEnrollmentsByUser } from "../../../services/enrollmentApi";
import { buildCourseLearningState } from "../../../services/learnerProgressStore";
import "./MyCourses.scss";
import { getCurrentUser } from "../../../services/userProfileStore.js";

function MyCourses() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

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

        const state = buildCourseLearningState(userId, course.id);
        return {
          ...course,
          completedLessons: state.completedLessons,
          totalLessons: state.totalLessons,
          progress: state.progressPercentage,
          certificateUnlocked: state.certificateUnlocked,
        };
      })
      .filter(Boolean);
  }, [courses, enrollments, userId]);

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

