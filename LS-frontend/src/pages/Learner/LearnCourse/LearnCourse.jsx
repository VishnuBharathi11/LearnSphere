import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./LearnCourse.scss";

function LearnCourse() {
  const { id } = useParams();
  const navigate = useNavigate();

  const courseId = Number(id);
  const currentUser = JSON.parse(window.appStore.getItem("currentUser"));

  const enrolledCourses =
    JSON.parse(window.appStore.getItem("enrolledCourses")) || [];

  const enrollment = enrolledCourses.find(
    (e) => e.courseId === courseId && e.studentId === currentUser?.id
  );

  const lessonsMap =
    JSON.parse(window.appStore.getItem("courseLessons")) || {};

  const lessons = lessonsMap[courseId] || [];

  const [currentIndex, setCurrentIndex] = useState(
    enrollment?.lastLessonIndex || 0
  );
  useEffect(() => {
    if (!enrollment) navigate(`/course/${courseId}`);
  }, [enrollment, courseId, navigate]);
  useEffect(() => {
    if (!enrollment) return;
    const updated = enrolledCourses.map((e) => {
      if (e.courseId !== courseId || e.studentId !== currentUser.id) return e;
      const completedLessons = Math.max(
        e.completedLessons || 0,
        currentIndex + 1
      );

      const totalLessons = lessons.length;

      const progress =
        totalLessons === 0
          ? 0
          : Math.floor((completedLessons / totalLessons) * 100);

      return {
        ...e,
        completedLessons,
        totalLessons,
        lastLessonIndex: currentIndex,
        progress,
      };
    });

    window.appStore.setItem("enrolledCourses", JSON.stringify(updated));
  }, [currentIndex, lessons.length]);

  if (!lessons.length) return <p>No lessons available.</p>;

  return (
    <div className="learn-page">
      <div className="learn-sidebar">
        <h3>Lessons</h3>
        {lessons.map((lesson, i) => (
          <div
            key={lesson.id}
            className={i === currentIndex ? "lesson active" : "lesson"}
            onClick={() => setCurrentIndex(i)}
          >
            {lesson.title}
          </div>
        ))}
      </div>
      <div className="learn-content">
        <h2>{lessons[currentIndex].title}</h2>
        <p>Lesson content placeholder</p>
        <button
          onClick={() =>
            setCurrentIndex((prev) => Math.min(prev + 1, lessons.length - 1))
          }
        >
          Next Lesson
        </button>
      </div>
    </div>
  );
}
export default LearnCourse;