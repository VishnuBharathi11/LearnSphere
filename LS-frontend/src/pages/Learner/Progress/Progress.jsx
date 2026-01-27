import React from 'react'
import SidebarStudent from '../../../components/SideBar-S/SidebarStudent'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./Progress.css";

const status = [
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
  },
  {
    title: "Data Science Fundamentals",
    instructor: "Dr. Lee",
    progress: 100,
    status: "Completed",
  },
  {
    title: "Cybersecurity",
    instructor: "John Smith",
    progress: 38,
    status: "In Progress",
  },
];
function Progress() {
  return (
    <div className="progress-layout">
      <SidebarStudent />

      <div className="progress-content">

        <div className="progress-header">
          <div>
            <h2>Learning Progress</h2>
            <p>Track your learning journey and achievements</p>
          </div>
        </div>

        <div className="stats-grid">
          {status.map((item, index) => (
            <div className="stat-card" key={index}>
              <p>{item.title}</p>
              <h3>{item.value}</h3>
            </div>
          ))}
        </div>

        <div className="chart-card">
          <h4>Weekly Learning Activity</h4>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="#4f6ef7"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="lower-grid">

          <div>
            <h4>Course Progress</h4>

            {courses.map((course, index) => (
              <div className="course-progress-card" key={index}>
                <div className="course-row">
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

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>

                <small>Progress: {course.progress}%</small>
              </div>
            ))}
          </div>
          <div>
            <h4>Achievements</h4>

            <div className="achievement-card">
              🏆 <strong>Web Development Master</strong>
              <p>Completed Nov 26, 2024</p>
            </div>

            <div className="achievement-tip">
              🔥 You're doing great! <br />
              Complete 1 more course to earn a new certificate.
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Progress