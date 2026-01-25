import React from 'react'
import NavBar from '../../components/NavBar/NavBar'
import courses from '../../data/courses'
import CourseCard from '../CourseCard/CourseCard'
import './BrowseCourses.css'
function BrowseCourses() {
  return (
    <>
    <NavBar/>
    <div className="browse-page">
      <div className="title">Browse Course</div>
      <div className="subtitle">Explore courses and find what you want to learn next</div>
      <div className="course-grid">
        {courses.map((course)=>(
          <CourseCard key={course.id} course={course}/>
        ))}
      </div>
    </div>
    </>
  )
}

export default BrowseCourses
