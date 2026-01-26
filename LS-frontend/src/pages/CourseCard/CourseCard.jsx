import React from "react";
import "./CourseCard.css";
import { useNavigate } from "react-router-dom";
function CourseCard({ course }) {
  const navigate = useNavigate();
  const CATEGORY_IMAGES = {
  "Web Development":
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
  "UI/UX Design":
    "https://images.unsplash.com/photo-1545235617-9465d2a55698",
  "Data Science": "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
  "Mobile Development":
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
  "Artificial Intelligence":
    "https://images.unsplash.com/photo-1531746790731-6c087fecd65a",
  "Cybersecurity": 
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
  "Cloud Computing":
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8",
  "DevOps": 
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  "Blockchain": 
  "https://images.unsplash.com/photo-1621761191319-c6fb62004040",
  "Software Engineering":
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
};
  return (
    <div className="course-card">
        <div className="course-image">
            <img src={CATEGORY_IMAGES[course.category] || "/fallback.png"}/>
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
