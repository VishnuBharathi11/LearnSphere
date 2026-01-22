import { useState } from "react";
import SidebarStudent from "../../components/SideBar-S/SidebarStudent";
import "./Mycourses.css";

const coursesData = [
  {
    id: 1,
    title: "Modern Frontend Development with React",
    instructor: "Arun Prakash",
    progress: 65,
  },
  {
    id: 2,
    title: "Data Science Fundamentals",
    instructor: "Dustin Hendrason",
    progress: 15,
  },
  {
    id: 3,
    title: "FullStack Java Web Development",
    instructor: "Eleven Hopper",
    progress: 100,
  },
  {
    id: 4,
    title: "UI / UX Design",
    instructor: "William Byers",
    progress: 72,
  },
];

function Mycourses() {
  const [filter, setFilter] = useState("all");

  const filteredCourses = coursesData.filter((course) => {
    if (filter === "inprogress") return course.progress < 100;
    if (filter === "completed") return course.progress === 100;
    return true;
  });
  return (
    <div className="learner-layout">
      <SidebarStudent />

      <div className="learner-content">
        <h2>My Courses</h2>

        <div className="course-tabs">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All Courses
          </button>

          <button
            className={filter === "inprogress" ? "active" : ""}
            onClick={() => setFilter("inprogress")}
          >
            In Progress
          </button>

          <button
            className={filter === "completed" ? "active" : ""}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
        </div>
        <div className="course-grid">
          {filteredCourses.length === 0 ? (
            <p>No courses found</p>
          ) : (
            filteredCourses.map((course) => (
              <div className="course-card" key={course.id}>
                <h4>{course.title}</h4>
                <p>{course.instructor}</p>

                <span>Progress: {course.progress}%</span>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>

                <button className="continue-btn">Continue Learning</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Mycourses;
