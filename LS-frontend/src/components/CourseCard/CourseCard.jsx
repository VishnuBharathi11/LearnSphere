import React from "react";
import "./CourseCard.scss";
import { useNavigate } from "react-router-dom";
import courseImg from "../../assets/Featured Courses/1.jpg";
function CourseCard({ course }) {
  const navigate = useNavigate();
  return (
    <div className="browse-course-card">
        <div className="course-card-image">
            <img
              src={course.thumbnail || courseImg}
              alt={course.courseName}
              loading="lazy"
              decoding="async"
            />
        </div>
      <div className="course-card-body">
        <div className="course-card-title">{course.courseName}</div>
      <div className="course-card-module">
        <div className="course-card-instructor">{course.instructor}</div>
        <div className="divider">•</div>
        <div className="course-card-module">Modules: {course.lessons}</div>
      </div>
      <div className="course-card-tags">
        <div className="course-card-category">{course.category}</div>
        <div className="course-card-level">{course.level}</div>
      </div>
      <div className="course-card-rating">⭐ {course.rating}</div>
      <div className="course-card-price">From ₹{course.price}</div>
      <button
        className="course-card-btn"
        onClick={() => navigate(`/course/${course.id}`)}
      >
        View Course
      </button>
      </div>
    </div>
  );
}

export default CourseCard;
