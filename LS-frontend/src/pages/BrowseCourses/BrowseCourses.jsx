import React, { useState } from "react";
import NavBar from "../../components/NavBar/NavBar";
import courses from "../../data/courses";
import CourseCard from "../CourseCard/CourseCard";
import "./BrowseCourses.css";
function BrowseCourses() {
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [price, setPrice] = useState("");
  const [search, setSearch] = useState("");
  const filteredCourses = courses.filter((course) => {
    const matchSearch = course.courseName
      ?.toLowerCase()
      .includes(search.trim().toLowerCase());
    const matchCategory =
      category === "" ||
      course.category.toLowerCase().trim() === category.trim();
    const matchlevel = level === "" || course.level.toLowerCase() === level;
    const matchPrice =
      price === "" ||
      (price === "free" && course.price === 0) ||
      (price === "min" && course.price >= 1 && course.price <= 499) ||
      (price === "mid" && course.price >= 500 && course.price <= 999) ||
      (price === "max" && course.price >= 1000);
    return matchSearch && matchCategory && matchlevel && matchPrice;
  });

  return (
    <>
      <NavBar />
      <div className="browse-page">
        <div className="title">Browse Course</div>
        <div className="subtitle">
          Explore courses and find what you want to learn next
        </div>
        <div className="filter-bar">
          <input
            type="search"
            placeholder="Search for Course"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Category</option>
            <option value="web development">Web Development</option>
            <option value="ui/ux design">UI/Ux Design</option>
            <option value="data science">Data Science</option>
            <option value="mobile development">Mobile Development</option>
            <option value="artificial intelligence">Artificial Intelligence</option>
            <option value="cybersecurity">Cybersecurity</option>
            <option value="cloud computing">Cloud Computing</option>
            <option value="devops">DevOps</option>
            <option value="blockchain">Blockchain</option>
            <option value="software engineering">Software Engineering</option>
          </select>

          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">Level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <select value={price} onChange={(e) => setPrice(e.target.value)}>
            <option value="">Price</option>
            <option value="free">Free</option>
            <option value="min">₹1 – ₹499</option>
            <option value="mid">₹500 – ₹999</option>
            <option value="max">₹1000+</option>
          </select>
        </div>

        <div className="course-grid">
          {filteredCourses.length === 0 ? (
            <p className="no-results">No courses found</p>
          ):(
            filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default BrowseCourses;
