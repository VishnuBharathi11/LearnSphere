import React from "react";
import "./CourseCard.css";
import { useNavigate } from "react-router-dom";
function CourseCard({ course }) {
  const navigate = useNavigate();
  return (
    <div className="course-card">
        <div className="course-image">
            <img src={CATEGORY_IMAGES[course.category]}/>
        </div>
      <div className="course">
        <div className="course-title">{course.courseName}</div>
      <div className="instructor-module">
        <div className="instructor">{course.instructor}</div>
        <div className="divider">•</div>
        <div className="module">Modules: {course.lessons}</div>
      </div>
      <div className="course-meta">
        <div className="category">{course.category}</div>
        <div className="level">{course.level}</div>
      </div>
      <div className="rating">⭐ {course.rating}</div>
      <div className="price">From ₹{course.price}</div>
      <button
        className="view-btn"
        onClick={() => navigate`(/course/${course.id})`}
      >
        View Course
      </button>
      </div>
    </div>
  );
}

export default CourseCard;
