import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {courses} from "../../../data/courses";
import NavBar from "../../../components/NavBar/NavBar";
import "./LearnCourse.scss";

function LearnCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const courseId = Number(id);
  const course = courses.find((c) => c.id === courseId);
  const enrolledCourses=JSON.parse(localStorage.getItem("enrolledCourses")) || [];;
  const enrollment = enrolledCourses.find((c) => c.courseId === courseId);
  const isEnrolled = enrolledCourses.some((c) => c.courseId === courseId);
  const curriculum = [
    {
      section: "Introduction to JavaScript",
      lessons: [
        {
          title: "What is JavaScript?",
          content: "JavaScript basics explained.",
          youtubeId: "YrOkVD_YUro",
        },
        {
          title: "Setting up environment",
          content: "VS Code and browser setup.",
          youtubeId: "xkMfMJn5Smg",
        },
      ],
    },
    {
      section: "Control Flow & Functions",
      lessons: [
        {
          title: "If / Else",
          content: "Conditional logic in JS.",
          youtubeId: "oukocVSYIDQ",
        },
        {
          title: "Loops",
          content: "Iteration using loops.",
          youtubeId: "8__9yNADp_Q",
        },
      ],
    },
  ];
  const allLessons = curriculum.flatMap((s) => s.lessons);
  const [activeLesson, setActiveLesson] = useState(() => {
    if (enrollment?.lastLessonIndex != null) {
      return allLessons[enrollment.lastLessonIndex];
    }
    return allLessons[0];
  });
  useEffect(() => {
    if (!enrollment) return;

    const lessonIndex = allLessons.findIndex(
      (l) => l.title === activeLesson.title,
    );
    const updated = enrolledCourses.map((c) =>
      c.courseId === courseId ? { ...c, lastLessonIndex: lessonIndex } : c,
    );
    localStorage.setItem("enrolledCourses", JSON.stringify(updated));
  }, [activeLesson,courseId]);
  useEffect(() => {
    if (!isEnrolled) {
      navigate(`/course/${courseId}`);
    }
  }, [isEnrolled, courseId, navigate]);
  if (!course) {
    return <p style={{ padding: "40px" }}>Course not found</p>;
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
            {activeLesson.youtubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${activeLesson.youtubeId}`}
                title={activeLesson.title}
                frameBorder="0"
                allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"
                allowFullScreen
              />
            ) : (
              <p>No video available for this lesson</p>
            )}
          </div>
          <p className="lesson-text">{activeLesson.content}</p>
        </div>
      </div>
    </>
  );
}

export default LearnCourse;
