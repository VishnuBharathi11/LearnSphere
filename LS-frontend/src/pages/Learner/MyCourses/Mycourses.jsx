import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import courseImg from "../../../assets/Featured Courses/1.jpg";
import { getPublishedCourses } from "../../../services/courseApi";
import { getEnrollmentsByCourses } from "../../../services/enrollmentApi";
import "./MyCourses.scss";

const CATEGORY_IMAGES = {
  "Web Development": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
  "UI/UX Design": "https://images.unsplash.com/photo-1545235617-9465d2a55698",
  "Data Science": "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
  "Mobile Development": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
  "Artificial Intelligence": "https://images.unsplash.com/photo-1531746790731-6c087fecd65a",
  Cybersecurity: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
  "Cloud Computing": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8",
  DevOps: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  Blockchain: "https://images.unsplash.com/photo-1621761191319-c6fb62004040",
  "Software Engineering": "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
};

function MyCourses() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  const currentUser = JSON.parse(window.appStore.getItem("currentUser") || "null");
  const userId = currentUser?.id || currentUser?.userId || "";

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const published = await getPublishedCourses(0, 200);
        if (!active) return;
        const safeCourses = Array.isArray(published) ? published : [];
        setCourses(safeCourses);

        const ids = safeCourses.map((course) => String(course.id));
        const allEnrollments = await getEnrollmentsByCourses(ids);
        if (!active) return;
        setEnrollments(Array.isArray(allEnrollments) ? allEnrollments : []);
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
  }, []);

  const myCourses = useMemo(() => {
    const backendActive = enrollments.filter(
      (enrollment) =>
        String(enrollment.userId) === String(userId) &&
        String(enrollment.status || "").toUpperCase() === "ACTIVE"
    );

    const baseEnrollments = backendActive;

    return baseEnrollments
      .map((enrollment) => {
        const course = courses.find((item) => String(item.id) === String(enrollment.courseId));
        if (!course) return null;

        return {
          ...course,
          completedLessons: Number(enrollment.completedLessons || 0),
          totalLessons: Number(enrollment.totalLessons || course.lessons || 0),
          progress: Number(enrollment.progressPercentage || 0),
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
                src={course.thumbnail || CATEGORY_IMAGES[course.category] || courseImg}
                alt={course.courseName}
                className="mycourse-img"
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
                  if (course.progress === 100) {
                    navigate(`/student-layout/download-certificate/${course.id}`);
                  } else {
                    navigate(`/student-layout/learn/${course.id}`);
                  }
                }}
              >
                {course.progress === 100 ? "Download Certificate" : "Continue Learning"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MyCourses;
