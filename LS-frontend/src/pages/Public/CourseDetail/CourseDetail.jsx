import { useNavigate, useParams} from "react-router-dom";
import {useState} from "react";
import NavBar from "../../../components/NavBar/NavBar.jsx";
import courses from "../../../data/courses.js";
import "./CourseDetail.scss";

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = courses.find((c) => c.id === Number(id));
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const curriculum = [
    {
      section: "Introduction to JavaScript",
      lessons: [
        { title: "What is JavaScript?", duration: "12 min", preview: true,youtubeId:"YrOkVD_YUro" },
        { title: "Setting up environment", duration: "15 min" },
        { title: "Your first JavaScript program", duration: "20 min" },
      ],
    },
    {
      section: "Control Flow & Functions",
      lessons: [
        { title: "If / Else statements", duration: "18 min" },
        { title: "Loops & Iterations", duration: "22 min" },
      ],
    },
    {
      section: "DOM Manipulation",
      lessons: [
        { title: "DOM Basics", duration: "20 min" },
        { title: "Events & Handlers", duration: "25 min" },
      ],
    },
  ];
  const [previewVideo,setPreviewVideo]=useState(null);
  if (!course) {
    return <p style={{ padding: "40px" }}>Course not found</p>;
  }
  const requireAuth = (callback) => {
    if (!isLoggedIn) {
      navigate("/login", {
        state: { from: `/course/${course.id}` },
      });
      return;
    }
    callback();
  };
  const isFree = course.price === 0;
  const handlePrimaryAction = () => {
    requireAuth(() => {
      if (isFree) {
        navigate(`/enroll/${course.id}`);
      } else {
        navigate(`/buy/${course.id}`);
      }
    });
  };
  const handleAddToCart = () => {
    requireAuth(() => {
      alert("Added to cart");
    });
  };
  const enrolledCourses = (() => {
    try {
      return JSON.parse(localStorage.getItem("enrolledCourses")) || [];
    } catch {
      return [];
    }
  })();
  const isEnrolled = enrolledCourses.some(
    (c)=>c.courseId===course.id
  );

  return (
    <>
      <NavBar />
      <div className="course-detail">
        <div className="course-hero">
          <h1 className="cd-course-title">{course.courseName}</h1>
          <p className="hero-desc">
            Master JavaScript from scratch with hands-on projects. Learn ES6+,
            DOM manipulation, async <br />
            programming, and modern development practices. Perfect for beginners
            who want to build a solid <br />
            foundation in JavaScript.
          </p>
          <div className="hero-meta">
            ⭐ {course.rating}&nbsp;&nbsp;&nbsp;&nbsp; •
            &nbsp;&nbsp;&nbsp;&nbsp;{course.lessons} lessons
            &nbsp;&nbsp;&nbsp;&nbsp;• &nbsp;&nbsp;&nbsp;&nbsp;{course.level}
          </div>
          <p className="hero-instructor">
            Created by <strong>{course.instructor}</strong>
          </p>
        </div>

        <div className="course-detail-grid">
          <div className="course-main">
            <div className="card">
              <h3>What you'll learn</h3>
              <ul className="learn-list">
                <li>Master JavaScript fundamentals and ES6+ features</li>
                <li>Understand DOM manipulation and events</li>
                <li>Implement modern development workflows</li>
                <li>Build interactive web applications</li>
                <li>Work with APIs and asynchronous JavaScript</li>
              </ul>
            </div>

            <div className="card">
              <h3>Course content</h3>
              {curriculum.map((block, i) => (
                <details key={i} className="accordion">
                  <summary>{block.section}</summary>
                  <ul>
                    {block.lessons.map((lesson, j) => (
                      <li key={j} onClick={()=>{
                        if(lesson.preview){
                          setPreviewVideo(lesson.youtubeId);
                        }
                      }}>
                        <span className="lesson-title">{lesson.title}</span>
                        <span className="lesson-meta">
                          {lesson.preview && (
                            <span className="preview">Preview</span>
                          )}
                          {lesson.duration}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>

              {previewVideo&&(
                <div className="preview-overlay">
                  <div className="preview-modal">
                    <button className="close-btn" onClick={()=>setPreviewVideo(null)}>✕</button>
                    <iframe src={`https://www.youtube.com/embed/${previewVideo}`} title="Course Preview" frameBorder="0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen />
                  </div>
                </div>
              )}

            <div className="card">
              <h3>Requirements</h3>
              <ul>
                <li>Basic understanding of HTML & CSS</li>
                <li>Computer with internet connection</li>
                <li>Code editor (VS Code recommended)</li>
              </ul>
            </div>

            <div className="card">
              <h3>Instructor</h3>
              <h4>{course.instructor}</h4>
              <p>Full Stack Developer & Educator</p>
              <p>
                Sarah is a passionate educator with over 8 years of experience
                in web development. She has taught thousands of students and
                believes in making programming accessible to everyone.
              </p>
            </div>
          </div>

          <div className="course-sidebar">
            {isEnrolled ? (
              <div className="price-card enrolled-card">
                <h3>You’re enrolled 🎉</h3>

                <button
                  className="cd-primary-btn"
                  onClick={() => navigate(`/learn/${course.id}`)}
                >
                  Start Learning
                </button>

                <p className="guarantee">
                  Lifetime access • Certificate included
                </p>
              </div>
            ) : (
              <div className="price-card">
                <div className="preview-box">Course Preview</div>
                <h2>{isFree ? "Free" : `₹${course.price}`}</h2>
                <button
                  className="cd-primary-btn"
                  onClick={() => {
                    if (isEnrolled) {
                      navigate(`/learn/${course.id}`);
                    } else {
                      handlePrimaryAction();
                    }
                  }}
                >
                  {isEnrolled
                    ? "Start Learning"
                    : isFree
                      ? "Enroll for Free"
                      : "Buy Now"}
                </button>
                {!isFree && (
                  <button
                    className="cd-secondary-btn"
                    onClick={handleAddToCart}
                  >
                    Add to Cart
                  </button>
                )}
                <p className="guarantee">30-Day Money-Back Guarantee</p>

                <div className="includes-title">
                  <h4>This course includes:</h4>
                  <ul className="includes">
                    <li className="video">12 hours on-demand video</li>
                    <li className="resource">24 downloadable resources</li>
                    <li className="certificate">Certificate of completion</li>
                    <li className="access">Lifetime access</li>
                    <li className="devices">Access on mobile and desktop</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}

export default CourseDetail;
