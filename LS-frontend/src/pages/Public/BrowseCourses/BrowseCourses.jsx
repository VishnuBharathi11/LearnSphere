import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import NavBar from "../../../components/NavBar/NavBar";
import CourseCard from "../../../components/CourseCard/CourseCard";
import Pagination from "../../../components/Pagination/Pagination";
import { getPublishedCourses } from "../../../services/courseApi";
import "./BrowseCourses.scss";

const COURSE_CARD_PLACEHOLDERS = 6;

function BrowseCourses() {
  const location = useLocation();
  const source = new URLSearchParams(location.search).get("source");

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [sort, setSort] = useState("default");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    getPublishedCourses()
      .then((data) => {
        if (!active) return;
        setCourses(data);
      })
      .catch(() => {
        if (!active) return;
        setError("Failed to load courses");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, level, search, sort]);

  const categories = useMemo(() => {
    const unique = [...new Set(courses.map((c) => c.category))].filter(Boolean);
    return ["All", ...unique];
  }, [courses]);

  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

  const filteredCourses = useMemo(() => {
    let result = [...courses];

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      result = result.filter((course) => course.title.toLowerCase().includes(term));
    }

    if (category !== "All") {
      result = result.filter((course) => course.category === category);
    }

    if (level !== "All") {
      result = result.filter((course) => course.level === level);
    }

    if (sort === "popular") {
      result.sort((a, b) => b.enrollments - a.enrollments);
    }

    return result;
  }, [category, courses, level, search, sort]);

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);

  const renderedCards = useMemo(() => {
    if (loading) {
      return Array.from({ length: COURSE_CARD_PLACEHOLDERS }, (_, index) => ({
        key: `loading-${index}`,
        type: "skeleton",
      }));
    }

    if (filteredCourses.length === 0) {
      return [];
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const slice = filteredCourses.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return slice.map((course) => ({
      key: String(course.id),
      type: "course",
      course,
    }));
  }, [filteredCourses, loading, currentPage]);

  return (
    <>
      <NavBar />
      <div className="browse-page">
        <h1>
          {source === "explore"
            ? "Explore Courses"
            : source === "cta"
              ? "Start Learning"
              : "Browse Courses"}
        </h1>
        <div className="subtitle">
          Explore courses and find what you want to learn next
        </div>

        <div className="filter-bar">
          <input
            type="search"
            placeholder="Search courses"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            {levels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="default">Default</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>

        {error ? <p className="no-results">{error}</p> : null}

        {!error && filteredCourses.length === 0 && !loading ? (
          <p className="no-results">No courses found</p>
        ) : null}

        {!error && renderedCards.length > 0 ? (
          <>
            <div className="course-grid">
              {renderedCards.map((item) =>
                item.type === "course" ? (
                  <CourseCard
                    key={item.key}
                    course={item.course}
                    showText={true}
                    showImage={true}
                  />
                ) : (
                  <CourseCard key={item.key} isSkeleton />
                )
              )}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        ) : null}
      </div>
    </>
  );
}

export default BrowseCourses;
