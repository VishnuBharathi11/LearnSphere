import React, { useEffect, useState } from "react";
import { FileText, Video, BookOpen } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./AddLesson.scss";
import { createCourseLesson, getCourseById, getCourseLessons, updateCourseLesson } from "../../../../services/courseApi";
import { getCurrentUser } from "../../../../services/userProfileStore.js";

function AddLesson() {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const editLessonId = String(searchParams.get("edit") || "").trim();
  const isEditMode = Boolean(editLessonId);
  const id = String(courseId);
  const navigate = useNavigate();
  const currentUser = getCurrentUser() || {};
  const currentRole = String(currentUser?.role || "").toLowerCase();
  const [course, setCourse] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [lessons, setLessons] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "theory",
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
      try {
        const list = await getCourseLessons(id);
        setLessons(Array.isArray(list) ? list : []);
      } catch {
        setLessons([]);
      }
    }
    loadLessons();
  }, [id]);

  useEffect(() => {
    if (!isEditMode) return;
    if (!Array.isArray(lessons)) return;
    const lesson = lessons.find((entry) => String(entry.id) === editLessonId);
    if (!lesson) {
      setLoadingLesson(false);
      return;
    }

    setForm({
      title: lesson.title || "",
      description: lesson.description || "",
      type: lesson.type || "theory",
      file: null,
      fileUrl: lesson.fileUrl || "",
      fileName: lesson.fileName || "",
      mimeType: lesson.mimeType || "",
    });
    setLoadingLesson(false);
  }, [isEditMode, lessons, editLessonId]);

  useEffect(() => {
    if (!isEditMode) return;
    setLoadingLesson(true);
  }, [isEditMode]);

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

  const handleTypeChange = (type) => {
    setForm((prev) => ({
      ...prev,
      type,
      description: type === "theory" ? prev.description : "",
      file: type === "theory" ? null : prev.file,
      fileUrl: type === "theory" ? "" : prev.fileUrl,
      fileName: type === "theory" ? "" : prev.fileName,
      mimeType: type === "theory" ? "" : prev.mimeType,
    }));
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
    if (form.type === "theory") {
      if (!form.description.trim()) return "Add lesson content";
    } else if (!form.fileUrl) {
      return "Upload lesson file";
    }

    const duplicate = lessons.find(
      (l) =>
        String(l.title || "").toLowerCase() === form.title.toLowerCase() &&
        String(l.id) !== editLessonId
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

    try {
      const payload = {
        title: form.title.trim(),
        heading: null,
        subheadings: [],
        description: form.type === "theory" ? form.description.trim() : "",
        type: form.type,
        fileUrl: form.fileUrl || "",
        fileName: form.fileName || "",
        mimeType: form.mimeType || "",
        orderIndex: isEditMode
          ? lessons.findIndex((l) => String(l.id) === editLessonId)
          : lessons.length,
      };

      if (isEditMode) {
        const updated = await updateCourseLesson(id, editLessonId, payload);
        setLessons((prev) =>
          prev.map((lesson) => (String(lesson.id) === editLessonId ? updated : lesson))
        );
      } else {
        const saved = await createCourseLesson(id, payload);
        setLessons((prev) => [...prev, saved]);
      }

      setMessage({ type: "success", text: isEditMode ? "Lesson updated successfully." : "Lesson added successfully." });
      setTimeout(() => navigate(`/instructor-layout/manage-courses/${id}/lessons`), 600);
    } catch {
      setMessage({ type: "error", text: isEditMode ? "Failed to update lesson." : "Failed to save lesson." });
    }
  };

  return (
    <div className="add-lesson-layout">
      <div className="add-lesson-page">
        <div className="add-lesson-header">
          <div>
            <h2>{isEditMode ? "Edit Lesson" : "Add New Lesson"}</h2>
            <p>
              {isEditMode
                ? "Update lesson details and content type."
                : "Fill in the details and choose the content type for this lesson."}
            </p>
          </div>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => navigate(`/instructor-layout/manage-courses/${id}/lessons`)}
          >
            Back to Lessons
          </button>
        </div>

        {message.text && <p className={`lesson-message ${message.type}`}>{message.text}</p>}

        <div className="add-lesson-card">
          {isEditMode && loadingLesson ? <p className="prefill-note">Loading previous lesson content...</p> : null}
          <div className="form-grid">
            <label>
              Lesson Title
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Enter lesson title"
              />
            </label>
          </div>


          <div className="content-type">
            <p>Choose content type</p>
            <div className="type-options">
              <button
                type="button"
                className={form.type === "theory" ? "active" : ""}
                onClick={() => handleTypeChange("theory")}
              >
                <BookOpen size={18} />
                Theory
              </button>
              <button
                type="button"
                className={form.type === "pdf" ? "active" : ""}
                onClick={() => handleTypeChange("pdf")}
              >
                <FileText size={18} />
                PDF
              </button>
              <button
                type="button"
                className={form.type === "video" ? "active" : ""}
                onClick={() => handleTypeChange("video")}
              >
                <Video size={18} />
                Video
              </button>
            </div>
          </div>

          {form.type === "theory" ? (
            <div className="notepad">
              <textarea
                placeholder="Write lesson content here..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          ) : (
            <div className="upload-stack">
              <label className="upload-box">
                <input
                  type="file"
                  accept={form.type === "pdf" ? ".pdf" : "video/*"}
                  onChange={handleFileChange}
                />
                <div>
                  <strong>{isEditMode ? "Replace" : "Upload"} {form.type === "pdf" ? "PDF" : "Video"}</strong>
                  <span>{form.fileName || "Choose file to upload"}</span>
                </div>
              </label>
              {isEditMode && form.fileUrl ? (
                <p className="prefill-note">
                  Existing file available:{" "}
                  <a href={form.fileUrl} target="_blank" rel="noreferrer">
                    {form.fileName || "Open current file"}
                  </a>
                </p>
              ) : null}
            </div>
          )}

          <div className="add-lesson-actions">
            <button className="primary-btn" onClick={handleSubmit}>
              {isEditMode ? "Update Lesson" : "Save Lesson"}
            </button>
            <button
              className="secondary-btn"
              onClick={() => navigate(`/instructor-layout/manage-courses/${id}/lessons`)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddLesson;
