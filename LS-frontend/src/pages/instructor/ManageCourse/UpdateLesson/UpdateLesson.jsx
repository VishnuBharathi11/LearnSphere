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
  updateCourseLesson,
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
  const [showModal, setShowModal] = useState(false);
  const [editLessonId, setEditLessonId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [form, setForm] = useState({
    title: "",
    heading: "",
    subheadings: [""],
    description: "",
    type: "video",
    file: null,
    fileUrl: "",
    fileName: "",
    mimeType: "",
  });

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
    return <p style={{ padding: 40 }}>Loading course...</p>;
  }

  if (!currentUser || currentRole !== "instructor" || !course) {
    return (
      <p style={{ padding: 40 }}>
        Access denied. You can upload lessons only for your own instructor courses.
      </p>
    );
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        file,
        fileUrl: String(reader.result || ""),
        fileName: file.name,
        mimeType: file.type || "",
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleTypeChange = (nextType) => {
    setForm((prev) => ({
      ...prev,
      type: nextType,
      description: nextType === "theory" ? prev.description : "",
      file: nextType === "theory" ? null : prev.file,
      fileUrl: nextType === "theory" ? "" : prev.fileUrl,
      fileName: nextType === "theory" ? "" : prev.fileName,
      mimeType: nextType === "theory" ? "" : prev.mimeType,
    }));
  };

  const validate = () => {
    if (!form.title.trim()) return "Lesson title required";
    if (!form.heading.trim()) return "Heading is required";
    const cleanedSubheadings = form.subheadings.map((s) => s.trim()).filter(Boolean);
    if (cleanedSubheadings.length === 0) return "Add at least one subheading";
    if (form.type === "theory") {
      if (!form.description.trim()) return "Add theory content";
    } else if (!form.fileUrl) {
      return "Upload a lesson file";
    }

    const duplicate = lessons.find(
      (l) =>
        l.title.toLowerCase() === form.title.toLowerCase() &&
        l.id !== editLessonId
    );

    if (duplicate) return "Lesson with same title already exists";

    return null;
  };

  const handleSubmit = async () => {
    setMessage({ type: "", text: "" });
    const error = validate();
    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }
    if (!editLessonId) {
      return;
    }
    try {
      const cleanedSubheadings = form.subheadings.map((s) => s.trim()).filter(Boolean);
      const updatedLesson = await updateCourseLesson(id, editLessonId, {
        title: form.title.trim(),
        heading: form.heading.trim(),
        subheadings: cleanedSubheadings,
        description: form.description.trim(),
        type: form.type,
        fileUrl: form.fileUrl || "",
        fileName: form.fileName || "",
        mimeType: form.mimeType || "",
        orderIndex: lessons.findIndex((l) => String(l.id) === String(editLessonId)),
      });
      setLessons((prev) =>
        prev.map((l) => (String(l.id) === String(editLessonId) ? updatedLesson : l))
      );
      setForm({
        title: "",
        heading: "",
        subheadings: [""],
        description: "",
        type: "video",
        file: null,
        fileUrl: "",
        fileName: "",
        mimeType: "",
      });
      setEditLessonId(null);
      setShowModal(false);
      setMessage({
        type: "success",
        text: "Lesson updated successfully.",
      });
    } catch {
      setMessage({ type: "error", text: "Failed to update lesson." });
    }
  };
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
    setForm({
      title: lesson.title,
      heading: lesson.heading || "",
      subheadings: Array.isArray(lesson.subheadings) && lesson.subheadings.length > 0 ? lesson.subheadings : [""],
      description: lesson.description || "",
      type: lesson.type,
      file: null,
      fileUrl: lesson.fileUrl || "",
      fileName: lesson.fileName || "",
      mimeType: lesson.mimeType || "",
    });
    setEditLessonId(lesson.id);
    setShowModal(true);
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
              const metaText = [lesson.heading, ...(Array.isArray(lesson.subheadings) ? lesson.subheadings : [])]
                .map((text) => String(text || "").trim())
                .filter(Boolean)
                .join(" | ");
              return (
                <div className="lesson-row" key={lesson.id}>
                  <div className="lesson-index">{index + 1}</div>
                  <div className="lesson-icon">{lessonIcon(lesson.type)}</div>
                  <div className="lesson-info">
                    <h3>{lesson.title}</h3>
                    <div className="lesson-meta">
                      <span className={`lesson-type-pill ${lesson.type}`}>
                        {lesson.type.toUpperCase()}
                      </span>
                      {metaText ? <span className="lesson-meta-text">{metaText}</span> : null}
                    </div>
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
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h2>{editLessonId ? "Edit Lesson" : "Add Lesson"}</h2>
              <div className="form-group">
                <input
                  placeholder="Lesson Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <input
                  placeholder="Heading"
                  value={form.heading}
                  onChange={(e) => setForm({ ...form, heading: e.target.value })}
                />
              </div>
              <div className="form-group subheading-group">
                <div className="subheading-header">
                  <span>Subheadings</span>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, subheadings: [...prev.subheadings, ""] }))
                    }
                  >
                    Add
                  </button>
                </div>
                <div className="subheading-list">
                  {form.subheadings.map((value, index) => (
                    <div className="subheading-item" key={index}>
                      <input
                        placeholder={`Subheading ${index + 1}`}
                        value={value}
                        onChange={(e) => {
                          const next = [...form.subheadings];
                          next[index] = e.target.value;
                          setForm((prev) => ({ ...prev, subheadings: next }));
                        }}
                      />
                      {form.subheadings.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const next = form.subheadings.filter((_, idx) => idx !== index);
                            setForm((prev) => ({ ...prev, subheadings: next }));
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <select
                  value={form.type}
                  onChange={(e) =>
                    handleTypeChange(e.target.value)
                  }
                >
                  <option value="theory">Theory</option>
                  <option value="video">Video</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
              {form.type === "theory" ? (
                <div className="form-group">
                  <textarea
                    placeholder="Theory content"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              ) : (
                <div className="form-group">
                  <input
                    type="file"
                    accept={form.type === "pdf" ? ".pdf" : "video/*"}
                    onChange={handleFileChange}
                  />
                </div>
              )}
              <div className="modal-actions">
                <button className="primary-btn" onClick={handleSubmit}>
                  {editLessonId ? "Updated" : "Add"}
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => {
                    setShowModal(false);
                    setEditLessonId(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default UpdateLesson;

