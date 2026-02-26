import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./LearnCourse.scss";

function resolveLessons(lessonMap, courseId) {
  const direct = lessonMap[String(courseId)] || lessonMap[Number(courseId)] || [];
  const scoped = Object.entries(lessonMap)
    .filter(([key]) => String(key).endsWith(`_${courseId}`))
    .flatMap(([, value]) => (Array.isArray(value) ? value : []));

  const merged = [...direct, ...scoped];
  const seen = new Set();
  return merged.filter((lesson) => {
    const key = `${lesson.id || lesson.title}-${lesson.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function LearnCourse() {
  const { id } = useParams();
  const navigate = useNavigate();

  const courseId = String(id);
  const currentUser = JSON.parse(window.appStore.getItem("currentUser") || "null");
  const userId = currentUser?.id || currentUser?.userId || "";

  const lessonMap = JSON.parse(window.appStore.getItem("courseLessons") || "{}");
  const lessons = useMemo(() => resolveLessons(lessonMap, courseId), [lessonMap, courseId]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!userId) {
      navigate("/login", { replace: true, state: { from: `/student-layout/learn/${courseId}` } });
      return;
    }

  }, [courseId, navigate, userId]);

  const activeLesson = lessons[currentIndex];

  const renderLessonContent = () => {
    if (!activeLesson) return null;

    if (activeLesson.type === "video") {
      if (activeLesson.fileUrl) {
        return (
          <video className="lesson-video" controls src={activeLesson.fileUrl}>
            Your browser does not support video playback.
          </video>
        );
      }
      return <p className="lesson-text">No video file attached for this lesson.</p>;
    }

    if (activeLesson.type === "pdf") {
      if (activeLesson.fileUrl) {
        return <iframe className="lesson-pdf" src={activeLesson.fileUrl} title={activeLesson.title} />;
      }
      return <p className="lesson-text">No PDF file attached for this lesson.</p>;
    }

    if (activeLesson.fileUrl) {
      return (
        <a className="lesson-download" href={activeLesson.fileUrl} target="_blank" rel="noreferrer">
          Open {activeLesson.fileName || "Document"}
        </a>
      );
    }

    return <p className="lesson-text">No document file attached for this lesson.</p>;
  };

  if (!lessons.length) {
    return (
      <div className="learn-empty">
        <h3>No lessons available yet</h3>
        <p>This course has no uploaded lessons at the moment.</p>
        <button onClick={() => navigate("/student-layout/my-courses")}>Back to My Courses</button>
      </div>
    );
  }

  return (
    <div className="learn-page">
      <div className="learn-sidebar">
        <h3>Lessons</h3>
        {lessons.map((lesson, index) => (
          <div
            key={`${lesson.id || lesson.title}-${index}`}
            className={index === currentIndex ? "lesson active" : "lesson"}
            onClick={() => setCurrentIndex(index)}
          >
            {lesson.title}
          </div>
        ))}
      </div>

      <div className="learn-content">
        <h2>{activeLesson?.title}</h2>
        {renderLessonContent()}

        <button
          onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, lessons.length - 1))}
          disabled={currentIndex === lessons.length - 1}
        >
          {currentIndex === lessons.length - 1 ? "Completed" : "Next Lesson"}
        </button>
      </div>
    </div>
  );
}

export default LearnCourse;
