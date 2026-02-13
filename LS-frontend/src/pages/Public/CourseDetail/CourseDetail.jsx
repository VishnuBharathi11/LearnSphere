import { useNavigate, useParams} from "react-router-dom";
import {useState} from "react";
import NavBar from "../../../components/NavBar/NavBar.jsx";
import {courses} from "../../../data/courses.js";
import "./CourseDetail.scss";

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = courses.find((c) => c.id === Number(id));
 const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [previewVideo,setPreviewVideo]=useState(null);
  if (!course) return <p style={{ padding: "40px" }}>Course not found</p>;
  const enrolledCourses=JSON.parse(localStorage.getItem("enrolledCourses"))||[];
  const isEnrolled = enrolledCourses.some(
    (e) => e.courseId === course.id && e.studentId === currentUser?.id
  );
  const enrollFreeCourse=()=>{
    if(!currentUser){
      navigate("/login",{state:{from:`/course/${course.id}`}});
      return;
    }
    const already=enrolledCourses.some((e)=>e.courseId===course.id&&e.studentId===currentUser.id);
    if(already){
      alert("Already enrolled");
      return;
    }
    enrolledCourses.push({
      courseId:course.id,studentId:currentUser.id,progress:0,lastLessonIndex:0,enrolledAt:new Date().toISOString(),paymentId:null,
    });
    localStorage.setItem("enrolledCourses", JSON.stringify(enrolledCourses));
    alert("Enrolled successfully");
  };
  const handlePrimaryAction = () => {
    if (course.price === 0) enrollFreeCourse();
    else navigate(`/buy/${course.id}`);
  };
  //   const curriculum = [
  //   {
  //     section: "Introduction to JavaScript",
  //     lessons: [
  //       { title: "What is JavaScript?", duration: "12 min", preview: true,youtubeId:"YrOkVD_YUro" },
  //       { title: "Setting up environment", duration: "15 min" },
  //       { title: "Your first JavaScript program", duration: "20 min" },
  //     ],
  //   },
  //   {
  //     section: "Control Flow & Functions",
  //     lessons: [
  //       { title: "If / Else statements", duration: "18 min" },
  //       { title: "Loops & Iterations", duration: "22 min" },
  //     ],
  //   },
  //   {
  //     section: "DOM Manipulation",
  //     lessons: [
  //       { title: "DOM Basics", duration: "20 min" },
  //       { title: "Events & Handlers", duration: "25 min" },
  //     ],
  //   },
  // ];
  
 
  return (
    <>
      <NavBar />

      <div className="course-detail">
        <div className="course-hero">
          <h1 className="cd-course-title">{course.courseName}</h1>
          <div className="hero-meta">
            ⭐ {course.rating} • {course.lessons} lessons • {course.level}
          </div>
        </div>

        <div className="course-detail-grid">
          <div className="course-main">
            {/* preview modal */}
            {previewVideo && (
              <div className="preview-overlay">
                <div className="preview-modal">
                  <button onClick={() => setPreviewVideo(null)}>✕</button>
                  <iframe
                    src={`https://www.youtube.com/embed/${previewVideo}`}
                    title="Preview"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="course-sidebar">
            {isEnrolled ? (
              <div className="price-card enrolled-card">
                <h3>You’re enrolled 🎉</h3>
                <button
                  className="cd-primary-btn"
                  onClick={() =>
                    navigate(`/student-layout/learn/${course.id}`)
                  }
                >
                  Start Learning
                </button>
              </div>
            ) : (
              <div className="price-card">
                <h2>{course.price === 0 ? "Free" : `₹${course.price}`}</h2>

                <button className="cd-primary-btn" onClick={handlePrimaryAction}>
                  {course.price === 0 ? "Enroll for Free" : "Buy Now"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default CourseDetail;
