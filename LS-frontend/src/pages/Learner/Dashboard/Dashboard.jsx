import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { courses } from "../../../data/courses";
import LearnerImg from "../../../assets/learner/learner.jpg";
import courseImg from "../../../assets/Featured Courses/1.jpg";
import "./Dashboard.scss";

function Dashboard() {
  const CATEGORY_IMAGES = {
  "Web Development":
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
  "UI/UX Design":
    "https://images.unsplash.com/photo-1545235617-9465d2a55698",
  "Data Science":
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
  "Mobile Development":
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
  "Artificial Intelligence":
    "https://images.unsplash.com/photo-1531746790731-6c087fecd65a",
  "Cybersecurity":
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
  "Cloud Computing":
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8",
  "DevOps":
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  "Blockchain":
    "https://images.unsplash.com/photo-1621761191319-c6fb62004040",
  "Software Engineering":
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
};
const navigate=useNavigate();
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
useEffect(() => {
  if (!currentUser) {
    navigate("/login");
  }
}, [currentUser, navigate]);
useEffect(()=>{
  if(!currentUser){
    navigate("/login");
  }
},[currentUser,navigate]);
  const enrolledCourses =
    JSON.parse(localStorage.getItem("enrolledCourses")) || [];
  const continueCourses = enrolledCourses
    .map(ec => {
      const course = courses.find(c => c.id === ec.courseId);
      if (!course) return null;

      return {
        ...course,
        progress: ec.progress ?? 0
      };
    })
    .filter(course => course && course.progress < 100);
  const recommendedCourses = courses
    .filter(
      course =>
        !enrolledCourses.some(ec => ec.courseId === course.id)
    )
    .slice(0, 5);
  return (
    <div className="dashboard-container">
      <div className="welcome-row">
        <div className="welcome-card">
          <div>
            <h2>Welcome Back, {currentUser.username}</h2>
            <p>Keep Learning and improve your skills.</p>
            {continueCourses.length>0&&(
              <button className="primary-btn" onClick={()=>navigate(`/student-layout/learn/${continueCourses[0].id}`)}>
              Continue Learning
            </button>
            )}
          </div>
          <img
            src={LearnerImg}
            alt="learning"
            className="welcome-img"
          />
        </div>
      </div>
      <div className="dashboard-grid">
        <div className="continue-section">
          <h3>Continue Learning</h3>
          <div className="course-grid">
            {continueCourses.length === 0 ? (
              <p>No courses in progress</p>
            ) : (
              continueCourses.map(course => (
                <div className="course-card" key={course.id} onClick={()=>navigate(`/student-layout/learn/${course.id}`)} style={{cursor:"pointer"}}>
                  <div className="course-cont">
                    <img
                      src={CATEGORY_IMAGES[course.category]|| courseImg}
                      alt={course.courseName}
                      className="cont-learn-img"
                    />
                    <div>
                      <h4>{course.courseName}</h4>
                      <p>{course.instructor}</p>
                    </div>
                  </div>
                  <div className="course-footer">
                    <span className="link">
                      Resume
                    </span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${course.progress}%`
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="recommended-section">
          <h3>Recommended Courses</h3>

          {recommendedCourses.length === 0 ? (
            <p>No recommendations available</p>
          ) : (
            recommendedCourses.map(course => (
              <div
                className="recommend-card"
                key={course.id}
                onClick={()=>navigate(`/course/${course.id}`)} style={{cursor:"pointer"}}
              >
                <img
                  src={CATEGORY_IMAGES[course.category]|| courseImg}
                  alt={course.title}
                />
                <div>
                  <h4>{course.courseName}</h4>
                  <p>⭐ {course.rating}</p>
                  <span>₹{course.price}</span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
