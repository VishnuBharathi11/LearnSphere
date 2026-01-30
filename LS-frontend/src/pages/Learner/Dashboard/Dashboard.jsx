import React from "react";
import LearnerImg from "../../../assets/learner/learner.jpg";
import courseImg from "../../../assets/Featured Courses/1.jpg"
import "./Dashboard.scss";

const continueCourses = [
  {
    title: "Modern Frontend Development with React",
    author: "Arun Prakash",
    progress: 45,
    image:courseImg,
  },
  {
    title: "Data Science Fundamentals",
    author: "Dustin Hendrason",
    progress: 15,
    image:courseImg,
  },
  {
    title: "Full Stack Java Web Development",
    author: "Eleven Hopper",
    progress: 98,
    image:courseImg,
  },
  {
    title: "UI/UX Design",
    author: "William Byers",
    progress: 72,
    image:courseImg,
  },
];

function Dashboard() {
  return (
      <div>
        <input type="search" placeholder="Search for courses" className="search-box" />
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

        <div className="dashboard-grid">
          <div className="continue-section">
            <h3>Continue Learning</h3>

            <div className="course-grid">
              {continueCourses.map((course, i) => (
                <div className="course-card" key={i}>

                  <div className="course-cont">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="cont-learn-img"
                    />

                    <div>
                      <h4>{course.title}</h4>
                      <p>{course.author}</p>
                    </div>
                  </div>

                  <div className="course-footer">
                    <span className="link">Continue Learning</span>
                    <span>{course.progress}%</span>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>

                </div>
              ))}
            </div>
          </div>

          <div className="recommended-section">
            <h3>Recommended Courses</h3>

            <div className="recommend-card">
              <img
                src={courseImg}
                alt=""
              />
              <div>
                <h4>Ethical Hacking & Cybersecurity Basics</h4>
                <p>⭐ 4.6 </p>
                <span>₹899</span>
              </div>
            </div>

            <div className="recommend-card">
              <img
                src={courseImg}
                alt=""
              />
              <div>
                <h4>DevOps & Cloud With Gen AI</h4>
                <p>⭐ 4.6 </p>
                <span>₹1099</span>
              </div>
            </div>
          </div>
          </div>
        </div>
  );
}

export default Dashboard;
