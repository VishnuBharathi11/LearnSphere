import { useState } from 'react'
import React from 'react'
import "./MyCourses.css"
import SidebarStudent from '../../components/SideBar-S/SidebarStudent'
import courses from '../../data/courses';

const learnerCourses = [
  { courseId: 1, progress: 0 },
  { courseId: 2, progress: 15 },
  { courseId: 3, progress: 65 },
  { courseId: 4, progress: 98 },
  { courseId: 5, progress: 100 }
];


function MyCourses() {
  const [activeTab, setActiveTab] = useState("all");

  const mergedCourses = learnerCourses.map((item) => {
    const course = courses.find((c) => c.id === item.courseId);
    return {
      ...course,
      progress: item.progress,
    };
  });

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
      <SidebarStudent/>
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
        {coursesToShow.map((course) => (
          <div className="mycourse-card" key={course.id}>
            <h4>{course.courseName}</h4>
            <p>{course.instructor}</p>

            <span className="progress-text">
              Progress: {course.progress}%
            </span>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>

            <button className="continue-btn">
              Continue Learning
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyCourses;