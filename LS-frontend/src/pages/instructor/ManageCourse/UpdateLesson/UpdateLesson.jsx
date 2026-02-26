import React, { useEffect, useState } from "react";
import {
  Video,
  FileText,
  File,
  Clock,
  Trash2,
  Edit,
  Plus,
  Form,
} from "lucide-react";
import { useParams } from "react-router-dom";
import "./UpdateLesson.scss";
import { getCourseById } from "../../../../services/courseApi";
function UpdateLesson() {
  const { courseId } = useParams();
  const id = String(courseId);
  const safeParse = (key, fallback) => {
    try {
      return JSON.parse(window.appStore.getItem(key)) || fallback;
    } catch {
      return fallback;
    }
  };
  const currentUser = JSON.parse(window.appStore.getItem("currentUser")) || {};
  const currentRole = String(currentUser?.role || "").toLowerCase();
  const [course, setCourse] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const lessonKey = `${currentUser?.id || "guest"}_${id}`;

  const lessonMap=safeParse("courseLessons",{});
  const [lessons, setLessons] = useState(lessonMap[lessonKey]||[]);
  const [showModal, setShowModal] = useState(false);
  const [editLessonId, setEditLessonId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [form, setForm] = useState({
    title: "",
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
    const map = safeParse("courseLessons", {});
    setLessons(map[lessonKey] || []);
  }, [lessonKey]);

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

  const persistLessons = (updatedLessons) => {
    const updatedMap = safeParse("courseLessons", {});
    updatedMap[lessonKey] = updatedLessons;
    window.appStore.setItem("courseLessons", JSON.stringify(updatedMap));
  };

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

  const validate = () => {
    if (!form.title.trim()) return "Lesson title required";

    const duplicate = lessons.find(
      (l) =>
        l.title.toLowerCase() === form.title.toLowerCase() &&
        l.id !== editLessonId
    );

    if (duplicate) return "Lesson with same title already exists";

    return null;
  };

  const handleSubmit = () => {
    setMessage({ type: "", text: "" });
    const error = validate();
    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }
    let updated;
    if (editLessonId) {
      updated = lessons.map((l) =>
        l.id === editLessonId
          ? {
              ...l,
              title: form.title,
              type: form.type,
              fileUrl: form.fileUrl || l.fileUrl || "",
              fileName: form.fileName || l.fileName || "",
              mimeType: form.mimeType || l.mimeType || "",
            }
          : l,
      );
    } else {
      const newLesson = {
        id: Date.now(),
        title: form.title,
        type: form.type,
        order: lessons.length,
        duration: form.type === "video" ? "00:00" : null,
        fileSize:
          form.type !== "video" && form.file
            ? `${(form.file.size / (1024 * 1024)).toFixed(1)}MB`
            : null,
        fileUrl: form.fileUrl || "",
        fileName: form.fileName || "",
        mimeType: form.mimeType || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updated = [...lessons, newLesson];
    }
    setLessons(updated);
    persistLessons(updated);
    setForm({ title: "", type: "video", file: null, fileUrl: "", fileName: "", mimeType: "" });
    setEditLessonId(null);
    setShowModal(false);
    setMessage({
      type: "success",
      text: editLessonId ? "Lesson updated successfully." : "Lesson added successfully.",
    });
  };
  const deleteLesson = (lessonId) => {
    const updated = lessons
      .filter((l) => l.id !== lessonId)
      .map((l, index) => ({ ...l, order: index }));
    setLessons(updated);
    persistLessons(updated);
  };
  const openEdit = (lesson) => {
    setForm({
      title: lesson.title,
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
          <p>{course.courseName}</p>
        </div>
        {message.text && <p className={`lesson-message ${message.type}`}>{message.text}</p>}
        <div className="lesson-card">
          {lessons.length === 0 ? (
            <p>No lessons added yet</p>
          ) : (
            lessons.map((lesson, index) => (
              <div className="lesson-row" key={lesson.id}>
                <div className="lesson-index">{index + 1}</div>
                <div className="lesson-icon">{lessonIcon(lesson.type)}</div>
                <div className="lesson-info">
                  <h3>{lesson.title}</h3>
                  <div className="lesson-meta">
                    <span className={`tag ${lesson.type}`}>
                      {lesson.type.toUpperCase()}
                    </span>
                    {lesson.duration && (
                      <span>
                        <Clock size={14} /> {lesson.duration}
                      </span>
                    )}

                    {lesson.fileSize && <span>{lesson.fileSize}</span>}
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
            ))
          )}
          <button className="add-lesson-btn" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Add Lesson
          </button>
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
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value,
                    })
                  }
                >
                  <option value="video">Video</option>
                  <option value="pdf">PDF</option>
                  <option value="document">Document</option>
                </select>
              </div>
              <div className="form-group">
                <input type="file" onChange={handleFileChange} />
              </div>
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
