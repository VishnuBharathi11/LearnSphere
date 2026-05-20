import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import NavBar from "../../../components/NavBar/NavBar";
import CourseCard from "../../../components/CourseCard/CourseCard";
import { useInitialLoadComplete } from "../../../components/GlobalNetworkLoader/InitialLoadContext.jsx";
import { useProgressiveReveal } from "../../../hooks/useProgressiveReveal";
import { getPublishedCourses } from "../../../services/courseApi";
import "./BrowseCourses.scss";

const COURSE_CARD_PLACEHOLDERS = 6;

function BrowseCourses() {
  const location = useLocation();
  const source = new URLSearchParams(location.search).get("source");
  const initialLoadComplete = useInitialLoadComplete();

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
      result = result.filter((course) => course.title.toLowerCase().includes(term));
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
  }, [category, courses, level, search, sort]);

  const reveal = useProgressiveReveal({
    isLoading: loading,
    hasData: filteredCourses.length > 0,
    hold: !initialLoadComplete,
    totalItems: filteredCourses.length,
    initialCount: 3,
  });

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

    const visibleCourses = filteredCourses.slice(0, reveal.visibleCount).map((course) => ({
      key: String(course.id),
      type: "course",
      course,
    }));

    const hiddenCount = Math.max(filteredCourses.length - reveal.visibleCount, 0);
    const hiddenSkeletons = Array.from({ length: hiddenCount }, (_, index) => ({
      key: `pending-${index}`,
      type: "skeleton",
    }));

    return [...visibleCourses, ...hiddenSkeletons];
  }, [filteredCourses, loading, reveal.visibleCount]);

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

        {error ? <p className="no-results">{error}</p> : null}

        {!error && filteredCourses.length === 0 && !loading ? (
          <p className="no-results">No courses found</p>
        ) : null}

        {!error && renderedCards.length > 0 ? (
          <div className="course-grid">
            {renderedCards.map((item) =>
              item.type === "course" ? (
                <CourseCard
                  key={item.key}
                  course={item.course}
                  showText={reveal.showText}
                  showImage={reveal.showImages}
                />
              ) : (
                <CourseCard key={item.key} isSkeleton />
              )
            )}
          </div>
        ) : null}
      </div>
    </>
  );
}

export default BrowseCourses;
