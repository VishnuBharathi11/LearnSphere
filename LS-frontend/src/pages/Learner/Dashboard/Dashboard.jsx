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
  // 1️⃣ Get enrolled courses from storage
  const enrolledCourses =
    JSON.parse(localStorage.getItem("enrolledCourses")) || [];

  // 2️⃣ Continue Learning (enrolled but not completed)
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

  // 3️⃣ Recommended Courses (not enrolled)
  const recommendedCourses = courses
    .filter(
      course =>
        !enrolledCourses.some(ec => ec.courseId === course.id)
    )
    .slice(0, 5);

  return (
    <div className="dashboard-container">
      {/* ===== WELCOME BOARD (UNCHANGED) ===== */}
      <div className="welcome-row">
        <div className="welcome-card">
          <div>
            <h2>Welcome Back, Tony!</h2>
            <p>Keep Learning!</p>
            <button className="primary-btn">
              Continue Learning
            </button>
          </div>

          <img
            src={LearnerImg}
            alt="learning"
            className="welcome-img"
          />
        </div>
      </div>

      {/* ===== DASHBOARD CONTENT ===== */}
      <div className="dashboard-grid">

        {/* ===== CONTINUE LEARNING ===== */}
        <div className="continue-section">
          <h3>Continue Learning</h3>

          <div className="course-grid">
            {continueCourses.length === 0 ? (
              <p>No courses in progress</p>
            ) : (
              continueCourses.map(course => (
                <div className="course-card" key={course.id}>
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
                      Continue Learning
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

        {/* ===== RECOMMENDED COURSES ===== */}
        <div className="recommended-section">
          <h3>Recommended Courses</h3>

          {recommendedCourses.length === 0 ? (
            <p>No recommendations available</p>
          ) : (
            recommendedCourses.map(course => (
              <div
                className="recommend-card"
                key={course.id}
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
