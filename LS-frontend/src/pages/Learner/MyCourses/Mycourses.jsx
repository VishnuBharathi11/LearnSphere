import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { courses } from "../../../data/courses";
import "./MyCourses.scss";

const CATEGORY_IMAGES = {
  "Web Development":
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
  "UI/UX Design":
    "https://images.unsplash.com/photo-1545235617-9465d2a55698",
  "Data Science":
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
  "Mobile Development":
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
  "Artificial Intelligence":
    "https://images.unsplash.com/photo-1531746790731-6c087fecd65a",
  "Cybersecurity":
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
  "Cloud Computing":
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8",
  "DevOps":
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  "Blockchain":
    "https://images.unsplash.com/photo-1621761191319-c6fb62004040",
  "Software Engineering":
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
};

function MyCourses() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const myCourses = useMemo(() => {
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

      return {
        ...course,
        completedLessons: completed,
        totalLessons: total,
        progress
      };
    })
    .filter(Boolean);
}, []);
  const coursesToShow = myCourses.filter(course => {
    if (activeTab === "progress")
      return course.progress > 0 && course.progress < 100;
    if (activeTab === "completed")
      return course.progress === 100;
    return true;
  });
  return (
    <div className="mycourses-container">
      <div className="tabs">
        <button
          className={activeTab === "all" ? "active" : ""}
          onClick={() => setActiveTab("all")}
        >
          All Courses
        </button>
        <button
          className={activeTab === "progress" ? "active" : ""}
          onClick={() => setActiveTab("progress")}
        >
          In Progress
        </button>
        <button
          className={activeTab === "completed" ? "active" : ""}
          onClick={() => setActiveTab("completed")}
        >
          Completed
        </button>
      </div>
      <div className="mycourse-grid">
        {coursesToShow.length === 0 ? (
          <p className="empty-text">No courses found</p>
        ) : (
          coursesToShow.map(course => (
            <div className="mycourse-card" key={course.id}>
              <img
                src={
                  CATEGORY_IMAGES[course.category] ||
                  CATEGORY_IMAGES.default
                }
                alt={course.courseName}
                className="mycourse-img"
              />
              <div className="mycourse-title">
                {course.courseName}
              </div>
              <div className="mycourse-instructor">
                {course.instructor}
              </div>
              <div className="mycourse-progress-text">
                Progress: {course.progress}%
              </div>
              <div className="mycourse-progress-track">
                <div
                  className="mycourse-progress-fill"
                  style={{
                    width: `${course.progress}%`
                  }}
                />
              </div>
              <button
                className="mycourse-btn"
                onClick={() => {
                  if (course.progress === 100) {
                    navigate(`/student-layout/certificate/${course.id}`,{
                      state:{courseName:course.courseName}
                    });
                  } else {
                    navigate(`/student-layout/learn/${course.id}`);
                  }
                }}
              >
                {course.progress === 100
                  ? "Download Certificate"
                  : "Continue Learning"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MyCourses;
