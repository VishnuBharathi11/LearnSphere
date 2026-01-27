import { useNavigate, useParams } from "react-router-dom";
import courses from "../../data/courses";
import "./CourseDetail.css";

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = courses.find((c) => c.id === Number(id));
  // const isLoggedIn=true;
  // const[activeTab,setActiveTab]=useState("overview");
  if (!course) {
    return <p style={{ padding: "40px" }}>Course not found</p>;
  }
  const isFree = course.price === 0;
  const handlePrimaryAction = () => {
    if (isFree) {
      navigate(`/enroll/${course.id}`);
    } else {
      navigate(`/buy/${course.id}`);
    }
  };
  const curriculum = [
    {
      section: "Introduction to JavaScript",
      lessons: [
        { title: "What is JavaScript?", duration: "12 min", preview: true },
        { title: "Setting up environment", duration: "15 min"},
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

  return (
    <div className="course-detail">
      <div className="course-hero">
        <h1 className="course-title">{course.courseName}</h1>
        <p className="hero-desc">
          Master JavaScript from scratch with hands-on projects. Learn ES6+, DOM manipulation, async <br />programming, and modern development practices. Perfect for beginners who want to build a solid <br />foundation in JavaScript.
        </p>
        <div className="hero-meta">
          ⭐ {course.rating}&nbsp;&nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp;&nbsp;{course.lessons} lessons &nbsp;&nbsp;&nbsp;&nbsp;• &nbsp;&nbsp;&nbsp;&nbsp;{course.level}
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
                    <li key={j}>
                      <span>{lesson.title}</span>
                      <span>
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
              Experienced web developer with a passion for teaching and helping
              students build real-world skills.
            </p>
          </div>
        </div>

        <div className="course-sidebar">
          <div className="price-card">
            <div className="preview-box">Course Preview</div>
            <h2>{isFree ? "Free" : `₹${course.price}`}</h2>
            <button className="primary-btn" onClick={handlePrimaryAction}>
              {isFree ? "Enroll for Free" : "Buy Now"}
            </button>
            {!isFree && <button className="secondary-btn">Add to Cart</button>}
            <p className="guarantee">30-Day Money-Back Guarantee</p>

            <ul className="includes">
              <li>12 hours on-demand video</li>
              <li>24 downloadable resources</li>
              <li>Certificate of completion</li>
              <li>Lifetime access</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;
