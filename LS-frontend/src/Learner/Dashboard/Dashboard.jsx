import React from "react";
import "./Dashboard.css";
import SidebarStudent from "../../components/SideBar-S/SidebarStudent";
import learnerimg from "../../assets/Learner/learner.jpg";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const weeklyData = [
  { day: "S", hours: 3 },
  { day: "M", hours: 5 },
  { day: "T", hours: 7 },
  { day: "W", hours: 6 },
  { day: "T", hours: 8 },
  { day: "F", hours: 10 },
  { day: "S", hours: 13 },
];
function Dashboard() {
  return (
    <div className="dashboard-layout">
      <SidebarStudent />

      <div className="dashboard-content">
        <input
          type="text"
          className="search-box"
          placeholder="Search courses"
        />

        <div className="dashboard-grid">
          <div className="left-section">
            <div className="welcome-card">
              <div>
                <h2>Welcome Back, Tony!</h2>
                <p>Keep Learning!</p>
                <button>Continue Learning</button>
              </div>
              <img src={learnerimg} alt="Learner" />
            </div>

            <div className="stats-row">
              <div className="stat-box">
                <h3>5</h3>
                <span>Enrolled Courses</span>
              </div>
              <div className="stat-box">
                <h3>18</h3>
                <span>Lessons Completed</span>
              </div>
              <div className="stat-box">
                <h3>2</h3>
                <span>Certificates</span>
              </div>
              <div className="stat-box">
                <h3>52</h3>
                <span>Hours Studied</span>
              </div>
            </div>

          <div className="right-section">
            <div className="chart-card">
              <p>Learning Progress</p>

              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={weeklyData}
                margin={{ top: 10, right: 20, left: -35, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="#4A6CF7"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            </div>
            </div>
            </div>
            </div>
    </div>
  );
}

export default Dashboard;
