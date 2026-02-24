import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import NavBar from "../../../components/NavBar/NavBar";
import CourseCard from "../../../components/CourseCard/CourseCard";
import { getPublishedCourses } from "../../../services/courseApi";
import "./BrowseCourses.scss";

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

  const categories = useMemo(() => {
    const unique = [...new Set(courses.map((c) => c.category))].filter(Boolean);
    return ["All", ...unique];
  }, [courses]);

  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

  const filteredCourses = useMemo(() => {
    let result = [...courses];

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      result = result.filter((course) =>
        course.title.toLowerCase().includes(term)
      );
    }

    if (category !== "All") {
      result = result.filter((course) => course.category === category);
    }

    if (level !== "All") {
      result = result.filter((course) => course.level === level);
    }

    if (sort === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    if (sort === "popular") {
      result.sort((a, b) => b.enrollments - a.enrollments);
    }

    return result;
  }, [courses, search, category, level, sort]);

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
            <option value="rating">Highest Rated</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>

        {loading && <p className="no-results">Loading courses...</p>}
        {error && <p className="no-results">{error}</p>}

        {!loading && !error && (
          <div className="course-grid">
            {filteredCourses.length === 0 ? (
              <p className="no-results">No courses found</p>
            ) : (
              filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default BrowseCourses;

