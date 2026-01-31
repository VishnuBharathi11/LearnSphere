import { useNavigate } from "react-router-dom";
import "./ReviewCourse.scss";

function ReviewCourse() {
  const navigate = useNavigate();

  const course = {
    title: "Advanced React Patterns",
    instructor: "Arun Prakash",
    category: "Web Development",
    description:
      "Master advanced React patterns including render props, HOCs, compound components, and more.",
    price: "₹1299",
    lessons: 35
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
            <div><span>Title:</span> {course.title}</div>
            <div><span>Instructor:</span> {course.instructor}</div>
            <div><span>Category:</span> {course.category}</div>
            <div><span>Lessons:</span> {course.lessons}</div>
            <div><span>Price:</span> {course.price}</div>
          </div>

          <div className="course-description">
            <h4>Description</h4>
            <p>{course.description}</p>
          </div>

          <div className="reject-section">
            <label>Rejection Reason (if rejecting)</label>
            <textarea placeholder="Provide a clear reason for rejection..." />
          </div>

          <div className="review-actions">
            <button className="approve">Approve Course</button>
            <button className="reject">Reject Course</button>
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