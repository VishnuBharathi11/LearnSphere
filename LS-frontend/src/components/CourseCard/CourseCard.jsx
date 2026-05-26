import React from "react";
import "./CourseCard.scss";
import { useNavigate } from "react-router-dom";
import courseImg from "../../assets/Featured Courses/1.jpg";
import ProgressiveImage from "../ProgressiveImage/ProgressiveImage.jsx";
import Skeleton from "../Skeleton/Skeleton.jsx";

function CourseCard({
  course = null,
  showText = true,
  showImage = true,
  isSkeleton = false,
}) {
  const navigate = useNavigate();

  if (isSkeleton || !course) {
    return (
      <div className="browse-course-card browse-course-card--skeleton" aria-hidden="true">
        <div className="course-card-image">
          <Skeleton className="course-card-image-skeleton" />
        </div>
        <div className="course-card-body">
          <Skeleton className="course-card-title-skeleton" />
          <div className="course-card-module">
            <Skeleton className="course-card-meta-skeleton course-card-meta-skeleton--wide" />
            <Skeleton className="course-card-meta-skeleton course-card-meta-skeleton--short" />
          </div>
          <div className="course-card-tags">
            <Skeleton className="course-card-tag-skeleton" />
            <Skeleton className="course-card-tag-skeleton" />
          </div>
          <Skeleton className="course-card-price-skeleton" />
          <Skeleton className="course-card-button-skeleton" />
        </div>
      </div>
    );
  }

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
        ) : (
          <>
            <Skeleton className="course-card-title-skeleton" />
            <div className="course-card-module">
              <Skeleton className="course-card-meta-skeleton course-card-meta-skeleton--wide" />
              <Skeleton className="course-card-meta-skeleton course-card-meta-skeleton--short" />
            </div>
            <div className="course-card-tags">
              <Skeleton className="course-card-tag-skeleton" />
              <Skeleton className="course-card-tag-skeleton" />
            </div>
            <Skeleton className="course-card-price-skeleton" />
            <Skeleton className="course-card-button-skeleton" />
          </>
        )}
      </div>
    </div>
  );
}

export default CourseCard;
