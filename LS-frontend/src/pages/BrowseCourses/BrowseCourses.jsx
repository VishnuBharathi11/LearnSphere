import React from "react";
import NavBar from "../../components/NavBar/NavBar";
import courses from "../../data/courses";
import CourseCard from "../CourseCard/CourseCard";
import "./BrowseCourses.css";
function BrowseCourses() {
  return (
    <>
      <NavBar />
      <div className="browse-page">
        <div className="title">Browse Course</div>
        <div className="subtitle">
          Explore courses and find what you want to learn next
        </div>
        <div className="search-bar">
          <input type="search" name="search" placeholder="Search for Course" />
        </div>
        <div className="filters">
          <div className="filter-category">
            <select name="category" id="">
              <option value="">Category</option>
              <option value="web development">Web Development</option>
              <option value="ui/ux design">UI/Ux Design</option>
              <option value="data science">Data Science</option>
              <option value="mobile developement">Mobile Development</option>
              <option value="artificial intelligence">
                Artificial Intelligence
              </option>
              <option value="cybersecurity">Cybersecurity</option>
              <option value="cloud computing">Cloud Computing</option>
              <option value="devops">DevOps</option>
              <option value="blockchain">Blockchain</option>
              <option value="software engineering">Software Engineering</option>
            </select>
          </div>
          <div className="filter-level">
            <select name="level" id="">
              <option value="">Level</option>
              <option value="beginner">Beginners</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="filter-price">
            <select name="price" id="">
              <option value="">Price</option>
              <option value="Free">Free</option>
              <option value="min">₹1 – ₹499</option>
              <option value="mid">₹500 – ₹999</option>
              <option value="max">₹1000+</option>
            </select>
          </div>
        </div>

        <div className="course-grid">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </>
  );
}

export default BrowseCourses;
