import React from "react";
import SidebarStudent from "../../../components/SideBar-S/SidebarStudent";
import progressImage from "../../../assets/Featured Courses/3.jpg";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./Progress.scss";

const stats = [
  { title: "Completed Courses", value: 3 },
  { title: "Enrolled Courses", value: 5 },
  { title: "Hours Studied", value: 52 },
  { title: "Certificates", value: 2 },
];

const weeklyData = [
  { day: "Mon", hours: 5 },
  { day: "Tue", hours: 8 },
  { day: "Wed", hours: 11 },
  { day: "Thu", hours: 5 },
  { day: "Fri", hours: 9 },
  { day: "Sat", hours: 14 },
  { day: "Sun", hours: 7 },
];

const courses = [
  {
    title: "Advance Java Script",
    instructor: "Sarah Chen",
    progress: 15,
    status: "In Progress",
    image: progressImage,
  },
  {
    title: "Data Science Fundamentals",
    instructor: "Dr. Lee",
    progress: 100,
    status: "Completed",
    image: progressImage,
  },
  {
    title: "Cybersecurity",
    instructor: "John Smith",
    progress: 38,
    status: "In Progress",
    image: progressImage,
  },
];

function Progress() {
  return (

      <div>
        <div className="progress-header">
          <p>Track your learning journey and achievements</p>
        </div>

        <div className="stats-grid">
          {stats.map((item, i) => (
            <div className="stat-card" key={i}>
              <p>{item.title}</p>
              <h3>{item.value}</h3>
            </div>
          ))}
        </div>

        <div className="chart-card">
          <h4>Weekly Learning Activity</h4>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="#4a6cf7"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="lower-grid">
          <div>
            <h4 className="prog-section-title">Course Progress</h4>

            {courses.map((course, index) => (
              <div className="course-progress-card" key={index}>
                <img
                  src={course.image}
                  alt={course.title}
                  className="course-img"
                />

                <div className="course-content">
                  <div className="course-header">
                    <div>
                      <h5>{course.title}</h5>
                      <span>{course.instructor}</span>
                    </div>

                    <span
                      className={
                        course.status === "Completed"
                          ? "badge completed"
                          : "badge progress"
                      }
                    >
                      {course.status}
                    </span>
                  </div>

                  <div className="course-progress-text">
                    Progress: {course.progress}%
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h4 className="prog-section-title">Achievements</h4>

            <div className="achievement-card">
              🏆 <strong>Web Development Master</strong>
              <p>Completed Nov 26, 2024</p>
            </div>

            <div className="achievement-tip">
              🔥 You're doing great!
              <br />
              Complete 1 more course to earn a new certificate.
            </div>
          </div>
        </div>
      </div>
  );
}

export default Progress;
