import React from 'react'
import { freeCourses } from '../../../data/courses'
import CourseCard from '../../../components/CourseCard/CourseCard'
import "./GetStarted.scss"
function GetStarted() {
  return (
    <div className="free-page">
      <h1>Get Started for free</h1>
      <p>No payment. No trial. Start learning immediately.</p>
      <div className="free-course-grid">
        {
          freeCourses.map(course=>(
            <CourseCard key={course.id} course={course}/>
          ))
        }
      </div>
    </div>
  )
}

export default GetStarted