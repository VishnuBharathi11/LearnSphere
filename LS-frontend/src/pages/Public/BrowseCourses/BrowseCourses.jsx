import { useMemo, useState } from "react";
import NavBar from "../../../components/NavBar/NavBar";
import { courses, popularCourses } from "../../../data/courses";
import CourseCard from "../../../components/CourseCard/CourseCard";
import "./BrowseCourses.scss";
import { useLocation } from "react-router-dom";
function BrowseCourses() {
  const location=useLocation();
  const source=new URLSearchParams(location.search).get("source");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [sort, setSort] = useState("default");
  const [search, setSearch] = useState("");
  
  const baseCourses=useMemo(()=>{
    return source==="cta"?popularCourses:courses;
  },[source]);
  const filteredCourses=useMemo(()=>{
    let result=[...baseCourses];
    if(search.trim()){
      result=result.filter(course=>
        course.title.toLowerCase().includes(search.LowerCase())
      );
    }
    if(category!=="All"){
      result=result.filter(course=>course.category===category);
    }
    if(level!=="All"){
      result=result.filter(course=>course.level===level);
    }
    if (sort === "rating") {
        result.sort((a, b) => b.rating - a.rating);
      }
      if(sort==="popular"){
        result.sort((a,b)=>b.enrollments-a.enrollments);
      }
      return result;
  },[baseCourses,search,category,level,sort]);
  return (
    <>
      <NavBar />
      <div className="browse-page">
        <h1>{source==="explore"?"Explore Courses":source==="cta"?"Start Learning":"Browse Courses"}</h1> {/*scss not done*/} 
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
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option >All</option>
            <option >Category</option>
            <option >Web Development</option>
            <option >UI/Ux Design</option>
            <option >Data Science</option>
            <option >Mobile Development</option>
            <option >Artificial Intelligence</option>
            <option >Cybersecurity</option>
            <option >Cloud Computing</option>
            <option >DevOps</option>
            <option >Blockchain</option>
            <option >Software Engineering</option>
          </select>

          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option >All</option>
            <option >Beginner</option>
            <option >Intermediate</option>
            <option >Advanced</option>
          </select>

          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="default">Default</option>
        <option value="rating">Highest Rated</option>
        <option value="popular">Most Popular</option>
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
