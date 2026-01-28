import React, { useState } from "react";
import "./MyCourses.css";
import SidebarStudent from "../../components/SideBar-S/SidebarStudent";
import courses from "../../data/courses";

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
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c"
};

const learnerCourses = [
  { courseId: 1, progress: 0 },
  { courseId: 2, progress: 15 },
  { courseId: 3, progress: 65 },
  { courseId: 4, progress: 98 },
  { courseId: 5, progress: 100 }
];

function MyCourses() {
  const [activeTab, setActiveTab] = useState("all");

  const mergedCourses = learnerCourses
    .map((item) => {
      const course = courses.find((c) => c.id === item.courseId);
      if (!course) return null;
      return { ...course, progress: item.progress };
    })
    .filter(Boolean);

  const allCourses = mergedCourses;

  const inProgressCourses = mergedCourses.filter(
    (course) => course.progress > 0 && course.progress < 100
  );

  const completedCourses = mergedCourses.filter(
    (course) => course.progress === 100
  );

  const coursesToShow =
    activeTab === "all"
      ? allCourses
      : activeTab === "progress"
      ? inProgressCourses
      : completedCourses;

  return (
    <div className="mycourses-layout">
      <SidebarStudent />

      <div className="mycourses-content">
        <h2 className="page-title">My Courses</h2>

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
            coursesToShow.map((course) => (
              <div className="mycourse-card" key={course.id}>
                <img
                  src={
                    CATEGORY_IMAGES[course.category] ||
                    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
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
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>

                <button className="mycourse-btn">
                  {course.progress === 100
                    ? "Download Certificate"
                    : "Continue Learning"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MyCourses;
