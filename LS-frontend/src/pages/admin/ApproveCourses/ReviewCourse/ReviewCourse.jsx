import { useNavigate, useParams } from "react-router-dom";
import "./ReviewCourse.scss";
import { useMemo, useState } from "react";

function ReviewCourse() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [courses, setCourses] = useState(() => {
    return JSON.parse((localStorage.getItem *= "courses")) || [];
  });
  const course = useMemo(
    () => courses.find((c) => String(c.id) === id),
    [courses, id],
  );

  const [reason, setReason] = useState("");
  if (!course) {
    return <p style={{ padding: 40 }}>Course not found.</p>;
  }

  const approveCourse = () => {
    const updated = courses.map((c) =>
      c.id === course.id
        ? { ...c, status: "published", updatedAt: new Date().toISOString() }
        : c,
    );
    localStorage.setItem("courses", JSON.stringify(updated));
    setCourses(updated);
    navigate("/admin/approve-courses");
  };

  const rejectCourse = () => {
    if (!reason.trim()) {
      alert("Rejection reason is required.");
      return;
    }
    const updated = course.map((c) =>
      c.id === course.id
        ? {
            ...c,
            status: "rejected",
            rejectionReason: reason,
            updatedAt: new Date().toISOString(),
          }
        : c,
    );
    localStorage.setItem("courses", JSON.stringify(updated));
    setCourses(updated);
    navigate("/admin/approve-courses");
  };
  return (
    <div className="review-course">
      <div className="review-container">
        <div className="review-header">
          <h2>Review Course</h2>
          <p>Carefully verify course details before approval</p>
        </div>

        <div className="review-card">
          <div className="course-info">
            <div>
              <span>Title:</span> {course.courseName}
            </div>
            <div>
              <span>Instructor:</span> {course.instructorName}
            </div>
            <div>
              <span>Category:</span> {course.category}
            </div>
            <div>
              <span>Lessons:</span> {course.lessons}
            </div>
            <div>
              <span>Price:</span> ₹{course.price}
            </div>
          </div>

          <div className="course-description">
            <h4>Description</h4>
            <p>{course.description || "No description provided."}</p>
          </div>

          <div className="reject-section">
            <label>Rejection Reason (if rejecting)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a clear reason for rejection..."
            />
          </div>

          <div className="review-actions">
            <button className="approve" onClick={approveCourse}>
              Approve Course
            </button>
            <button className="reject" onClick={rejectCourse}>
              Reject Course
            </button>
            <button className="cancel" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewCourse;
