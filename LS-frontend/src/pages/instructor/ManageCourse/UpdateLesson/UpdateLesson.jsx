import React, { useEffect, useState } from "react";
import {
  Video,
  FileText,
  File,
  Trash2,
  Edit,
  Plus,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import "./UpdateLesson.scss";
import {
  deleteCourseLesson,
  getCourseById,
  getCourseLessons,
} from "../../../../services/courseApi";
import { getCurrentUser } from "../../../../services/userProfileStore.js";
function UpdateLesson() {
  const { courseId } = useParams();
  const id = String(courseId);
  const navigate = useNavigate();
  const currentUser = getCurrentUser() || {};
  const currentRole = String(currentUser?.role || "").toLowerCase();
  const [course, setCourse] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [lessons, setLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [lessonError, setLessonError] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    async function loadCourse() {
      try {
        const fetched = await getCourseById(id);
        if (String(fetched?.instructorId) === String(currentUser?.id)) {
          setCourse(fetched);
        } else {
          setCourse(null);
        }
      } catch {
        setCourse(null);
      } finally {
        setLoadingCourse(false);
      }
    }
    loadCourse();
  }, [id, currentUser?.id]);

  useEffect(() => {
    async function loadLessons() {
      setLoadingLessons(true);
      setLessonError("");
      try {
        const list = await getCourseLessons(id);
        setLessons(Array.isArray(list) ? list : []);
      } catch {
        setLessons([]);
        setLessonError("Unable to load lessons. Please try again.");
      } finally {
        setLoadingLessons(false);
      }
    }
    loadLessons();
  }, [id]);

  if (loadingCourse) {
    return null;
  }

  if (!currentUser || currentRole !== "instructor" || !course) {
    return (
      <p style={{ padding: 40 }}>
        Access denied. You can upload lessons only for your own instructor courses.
      </p>
    );
  }

  const deleteLesson = (lessonId) => {
    deleteCourseLesson(id, lessonId)
      .then(() => {
        setLessons((prev) => prev.filter((l) => String(l.id) !== String(lessonId)));
      })
      .catch(() => {
        setMessage({ type: "error", text: "Failed to delete lesson." });
      });
  };
  const openEdit = (lesson) => {
    navigate(`/instructor-layout/manage-courses/${id}/lessons/new?edit=${encodeURIComponent(String(lesson.id))}`);
  };
  const lessonIcon = (type) => {
    if (type === "video") return <Video size={22} />;
    if (type === "pdf") return <FileText size={22} />;
    return <File size={22} />;
  };

  return (
    <div className="upload-lesson-layout">
      <div className="upload-lessons-page">
        <div className="page-header">
          <button
            className="primary-action"
            onClick={() => navigate(`/instructor-layout/manage-courses/${id}/lessons/new`)}
          >
            <Plus size={16} /> Add New Lesson
          </button>
        </div>

        <div className="course-banner">
          <div>
            <span className="course-label">Course</span>
            <h3>{course.courseName}</h3>
          </div>
          <div className="course-meta">
            <div>
              <span>Total Lessons</span>
              <strong>{lessons.length}</strong>
            </div>
            <div>
              <span>Last Updated</span>
              <strong>
                {lessons[lessons.length - 1]?.uploadedAt
                  ? new Date(lessons[lessons.length - 1]?.uploadedAt).toLocaleDateString()
                  : "-"}
              </strong>
            </div>
          </div>
        </div>
        {message.text && <p className={`lesson-message ${message.type}`}>{message.text}</p>}
        <div className="lesson-card">
          {loadingLessons ? (
            <div className="empty-state">
              <p>Loading lessons...</p>
            </div>
          ) : lessonError ? (
            <div className="empty-state">
              <p>{lessonError}</p>
              <button
                className="ghost-btn"
                onClick={() => navigate(0)}
              >
                Retry
              </button>
            </div>
          ) : lessons.length === 0 ? (
            <div className="empty-state">
              <p>No lessons added yet</p>
              <button
                className="ghost-btn"
                onClick={() => navigate(`/instructor-layout/manage-courses/${id}/lessons/new`)}
              >
                + Add New Lesson
              </button>
            </div>
          ) : (
            lessons.map((lesson, index) => {
              return (
                <div className="lesson-row" key={lesson.id}>
                  <div className="lesson-index">{index + 1}</div>
                  <div className="lesson-icon">{lessonIcon(lesson.type)}</div>
                  <div className="lesson-info">
                    <h3>{lesson.title}</h3>
                  </div>
                  <div className="lesson-actions">
                    <button onClick={() => openEdit(lesson)}>
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteLesson(lesson.id)}
                      className="lesson-actions delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
export default UpdateLesson;

