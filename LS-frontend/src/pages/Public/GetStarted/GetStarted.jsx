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
      <h1>Get Started for free</h1>
      <p>No payment. No trial. Start learning immediately.</p>
      <div className="free-course-grid">
        {loading && <p>Loading free courses...</p>}
        {!loading && error && <p>{error}</p>}
        {!loading &&
          !error &&
          paginatedFreeCourses.map((course) => <CourseCard key={course.id} course={course} />)}
      </div>
      {!loading && !error && (
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
