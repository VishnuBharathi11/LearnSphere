import { useEffect, useMemo, useState } from "react";
import CourseCard from "../../../components/CourseCard/CourseCard";
import Pagination from "../../../components/Pagination/Pagination";
import { getPublishedCourses } from "../../../services/courseApi";
import "./GetStarted.scss";
function GetStarted() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getPublishedCourses()
      .then((list) => {
        if (!active) return;
        setCourses(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!active) return;
        setError("Unable to load free courses right now.");
        setCourses([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const freeCourses = useMemo(
    () => courses.filter((course) => Number(course.price || 0) === 0),
    [courses]
  );
  const totalPages = Math.ceil(freeCourses.length / ITEMS_PER_PAGE);
  const paginatedFreeCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return freeCourses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [freeCourses, currentPage]);
  return (
    <div className="free-page">
      <header className="free-courses-hero">
        <div className="hero-content">
          <span className="hero-eyebrow">Zero Cost, Unlimited Potential</span>
          <h1>Start Learning for Free</h1>
          <p>
            Explore our selection of free introductory courses. Create an account to track your progress and earn certificates at no cost.
          </p>
        </div>
        <div className="hero-visual">
          <div className="visual-badge">Free Courses</div>
        </div>
      </header>
      <div className="free-course-grid">
        {loading && <p>Loading free courses...</p>}
        {!loading && error && <p>{error}</p>}
        {!loading &&
          !error &&
          freeCourses.length === 0 && (
            <p className="no-results">No free courses are currently available. Check back soon or browse our full catalog.</p>
          )}
        {!loading &&
          !error &&
          paginatedFreeCourses.map((course) => <CourseCard key={course.id} course={course} />)}
      </div>
      {!loading && !error && freeCourses.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
export default GetStarted;