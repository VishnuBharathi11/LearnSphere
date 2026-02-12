import React, { useState } from "react";
import { Video, FileText, File, Clock, Trash2, Edit, Plus } from "lucide-react";
import { useParams } from "react-router-dom";
import "./UpdateLesson.scss";

function UpdateLesson() {
  const { courseId } = useParams();
  const id = String(courseId);
  const storedLessons = JSON.parse(localStorage.getItem("courseLessons")) || {};
  const [lessons, setLessons] = useState(storedLessons[id] || []);
  const [showModal, setShowModal] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: "",
    type: "video",
    file: null,
  });
  const saveLessons = (updatedLessons) => {
    const allLessons = JSON.parse(localStorage.getItem("courseLessons")) || {};
    allLessons[id] = updatedLessons;
    localStorage.setItem("courseLessons", JSON.stringify(allLessons));
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewLesson({ ...newLesson, file });
  };
  const addLesson = () => {
    if (!newLesson.title || !newLesson.file) return;
    const lesson = {
      id: Date.now(),
      title: newLesson.title,
      type: newLesson.type,
      duration: newLesson.type === "video" ? "00:00" : null,
      fileSize:
        newLesson.type !== "video"
          ? `${(newLesson.file.size / (1024 * 1024)).toFixed(1)} MB`
          : null,
    };
    const updated = [...lessons, lesson];
    setLessons(updated);
    saveLessons(updated);
    setNewLesson({ title: "", type: "video", file: null });
    setShowModal(false);
  };
  const deleteLesson = (lessonId) => {
    const updated = lessons.filter((l) => l.id !== lessonId);
    setLessons(updated);
    saveLessons(updated);
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
          <div>
            <h1>Upload Lessons</h1>
            <p>Course ID: {id}</p>
          </div>
        </div>
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
                  <button>
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
              <h2>Add New Lesson</h2>
              <div className="form-group">
                <label>Lesson Title</label>
                <input
                  value={newLesson.title}
                  onChange={(e) =>
                    setNewLesson({
                      ...newLesson,
                      title: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Lesson Type</label>
                <select
                  value={newLesson.type}
                  onChange={(e) =>
                    setNewLesson({
                      ...newLesson,
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
                <label>Upload File</label>
                <input type="file" onChange={handleFileChange} />
              </div>
              <div className="modal-actions">
                <button className="primary-btn" onClick={addLesson}>
                  Add Lesson
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => setShowModal(false)}
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
