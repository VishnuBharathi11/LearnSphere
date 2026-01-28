import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import courses from "../../../data/courses";
import NavBar from "../../../components/NavBar/NavBar";
import "./LearnCourse.css";

function LearnCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = courses.find(c => c.id === Number(id));
  const enrolledCourses =JSON.parse(localStorage.getItem("enrolledCourses")) || [];
  const isEnrolled = enrolledCourses.includes(Number(id));
  const curriculum = [
    {
      section: "Introduction to JavaScript",
      lessons: [
        { title: "What is JavaScript?", content: "JavaScript basics explained." },
        { title: "Setting up environment", content: "VS Code and browser setup." },
      ],
    },
    {
      section: "Control Flow & Functions",
      lessons: [
        { title: "If / Else", content: "Conditional logic in JS." },
        { title: "Loops", content: "Iteration using loops." },
      ],
    },
  ];
  const [activeLesson, setActiveLesson] = useState(curriculum[0].lessons[0]);
  if (!course) {
    return <p style={{ padding: "40px" }}>Course not found</p>;
  }
  if (!isEnrolled) {
    navigate(`/course/${id}`);
    return null;
  }
  return (
    <>
      <NavBar />
      <div className="learn-page">
        <div className="learn-sidebar">
          <h3>{course.courseName}</h3>
          {curriculum.map((section, i) => (
            <div key={i} className="lesson-section">
              <p className="section-title">{section.section}</p>
              <ul>
                {section.lessons.map((lesson, j) => (
                  <li
                    key={j}
                    className={
                      activeLesson.title === lesson.title
                        ? "lesson active"
                        : "lesson"
                    }
                    onClick={() => setActiveLesson(lesson)}
                  >
                    ▶ {lesson.title}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="learn-content">
          <h2>{activeLesson.title}</h2>
          <div className="video-box">
            Video Player Placeholder
          </div>
          <p className="lesson-text">
            {activeLesson.content}
          </p>
        </div>
      </div>
    </>
  );
}

export default LearnCourse;
