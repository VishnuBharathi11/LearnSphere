import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {courses} from "../../../data/courses";
import "./LearnCourse.scss";

function LearnCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const courseId = Number(id);
  const course = courses.find((c) => c.id === courseId);
  const enrolledCourses=JSON.parse(localStorage.getItem("enrolledCourses")) || [];;
  const enrollment = enrolledCourses.find((c) => c.courseId === courseId);
  const isEnrolled = enrolledCourses.some((c) => c.courseId === courseId);
    useEffect(() => {
    if (!isEnrolled) {
      navigate(`/course/${courseId}`);
    }
  }, [isEnrolled, courseId, navigate]);
  const curriculum = [
    {
      section: "Introduction to JavaScript",
      lessons: [
        {
          title: "What is JavaScript?",
          content: "JavaScript basics explained.",
          youtubeId: "YrOkVD_YUro",
        },
        {
          title: "Setting up environment",
          content: "VS Code and browser setup.",
          youtubeId: "xkMfMJn5Smg",
        },
      ],
    },
    {
      section: "Control Flow & Functions",
      lessons: [
        {
          title: "If / Else",
          content: "Conditional logic in JS.",
          youtubeId: "oukocVSYIDQ",
        },
        {
          title: "Loops",
          content: "Iteration using loops.",
          youtubeId: "8__9yNADp_Q",
        },
      ],
    },
  ];
  const allLessons = curriculum.flatMap((s) => s.lessons);
  const[activeIndex,setActiveIndex]=useState(enrollment?.lastLessonIndex??0);
  const activeLesson=allLessons[activeIndex];
  const markCompelete=()=>{
    const updated=enrolledCourses.map((c)=>{
      if(c.courseId!==courseId)
        return c;
      const completed=Math.max(c.completedLessons||0,activeIndex+1);
      return{
        ...c,completedLessons:completed,
        totalLessons:allLessons.length,
        lastLessonIndex:activeIndex,
      };
    });
    localStorage.setItem("enrolledCourses",JSON.stringify(updated));
    alert("Lesson marked as completed!");
  }
   if (!course) return <p style={{ padding: 40 }}>Course not found</p>;
  return (
    <>
      <div className="learn-page">
        <div className="learn-sidebar">
          <h3>{course.courseName}</h3>
          {curriculum.map((section, i) => (
            <div key={i} className="lesson-section">
              <p className="section-title">{section.section}</p>
              <ul>
                {section.lessons.map((lesson, j) => {
                  const idx=curriculum.slice(0,i).reduce((sum,s)=>sum+s.lessons.length,0)+j;
                  return(
                    <li key={j} className={activeIndex===idx?"lesson active":"lesson"} onClick={()=>setActiveIndex(idx)}>▶ {lesson.title}</li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
        <div className="learn-content">
          <h2>{activeLesson.title}</h2>
          <div className="video-box">
            {activeLesson.youtubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${activeLesson.youtubeId}`}
                title={activeLesson.title}
                frameBorder="0"
                allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"
                allowFullScreen
              />
            ) : (
              <p>No video available for this lesson</p>
            )}
          </div>
          <p className="lesson-text">{activeLesson.content}</p>
          <button className="complete-btn" onClick={markCompelete}>Mark Lesson as Complete</button>
          {enrollment?.completedLessons>=allLessons.length&&(
            <button className="primary-btn" onClick={()=>navigate(`/student-layout/assessment`)}>Take Assessment</button>
          )}
        </div>
      </div>
    </>
  );
}

export default LearnCourse;
