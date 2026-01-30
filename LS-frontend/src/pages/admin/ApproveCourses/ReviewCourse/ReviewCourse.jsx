import {  useNavigate } from "react-router-dom";
import "./ReviewCourse.scss";

function ReviewCourse(){
//   const { courseId } = useParams();
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
      <h2>Review Course</h2>

      <div className="review-card">
        <p><b>Title:</b> {course.title}</p>
        <p><b>Instructor:</b> {course.instructor}</p>
        <p><b>Category:</b> {course.category}</p>
        <p><b>Lessons:</b> {course.lessons}</p>
        <p><b>Price:</b> {course.price}</p>

        <div className="desc">
          <b>Description</b>
          <p>{course.description}</p>
        </div>

        <label>Rejection Reason (if rejecting)</label>
        <textarea placeholder="Provide a reason for rejection..." />

        <div className="actions">
          <button className="approve">Approve Course</button>
          <button className="reject">Reject Course</button>
          <button className="cancel" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewCourse;
