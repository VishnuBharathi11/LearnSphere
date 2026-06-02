import React from "react";
import "./CourseCard.scss";
import { useNavigate } from "react-router-dom";
import courseImg from "../../assets/Featured Courses/1.jpg";
import ProgressiveImage from "../ProgressiveImage/ProgressiveImage.jsx";
function CourseCard({
  course = null,
  showText = true,
  showImage = true,
}) {
  const navigate = useNavigate();
  if (!course) return null;
  return (
    <div className="browse-course-card">
      <div className="course-card-image">
        <ProgressiveImage
          src={course.thumbnail}
          fallbackSrc={courseImg}
          alt={course.courseName}
          reveal={showImage}
          className="course-card-image-asset"
          skeletonClassName="course-card-image-skeleton"
        />
      </div>
      <div className="course-card-body">
        {showText ? (
          <>
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
            <div className="course-card-price">From ₹{course.price}</div>
            <button
              className="course-card-btn"
              onClick={() => navigate(`/course/${course.id}`)}
            >
              View Course
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
export default CourseCard;
