import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ReviewCourse.scss";
import { getAdminCourses, publishCourse, rejectCourse } from "../../../../services/courseApi";

function ReviewCourse() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState("");

  useEffect(() => {
    let active = true;
    async function loadCourses() {
      try {
        const list = await getAdminCourses();
        if (!active) return;
        setCourses(Array.isArray(list) ? list : []);
      } catch {
        if (!active) return;
        setCourses([]);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadCourses();
    return () => {
      active = false;
    };
  }, []);

  const course = useMemo(
    () => courses.find((item) => String(item.id) === String(id)),
    [courses, id]
  );

  if (loading) {
    return null;
  }

  if (!course) {
    return <p style={{ padding: 40 }}>Course not found.</p>;
  }

  const approveCurrentCourse = async () => {
    await publishCourse(String(course.id));
    navigate("/admin-layout/approve-courses", { replace: true });
  };

  const rejectCurrentCourse = async () => {
    if (!reason.trim()) {
      alert("Rejection reason is required.");
      return;
    }
    await rejectCourse(String(course.id), reason.trim());
    navigate("/admin-layout/approve-courses", { replace: true });
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
              <span>Instructor:</span> {course.instructor || course.instructorId}
            </div>
            <div>
              <span>Category:</span> {course.category}
            </div>
            <div>
              <span>Lessons:</span> {course.lessons}
            </div>
            <div>
              <span>Price:</span> INR {course.price}
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
              onChange={(event) => setReason(event.target.value)}
              placeholder="Provide a clear reason for rejection..."
            />
          </div>

          <div className="review-actions">
            <button className="approve" onClick={approveCurrentCourse}>
              Approve Course
            </button>
            <button className="reject" onClick={rejectCurrentCourse}>
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
