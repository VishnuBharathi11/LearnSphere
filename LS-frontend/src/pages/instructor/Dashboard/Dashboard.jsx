import React from "react";
import {
  BookOpen,
  Users,
  Star,
  DollarSign,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import SidebarInstructor from "../../../components/SideBar-I/SidebarInstructor";
import "./Dashboard.scss";

function Dashboard() {
  const stats = [
    { title: "Total Courses", value: "10", icon: BookOpen },
    { title: "Total Students", value: "1,247", icon: Users },
    { title: "Avg. Rating", value: "4.7", icon: Star },
    { title: "Revenue", value: "₹1,24,500", icon: DollarSign },
  ];
  const enrollmentData = [
    { month: "Jan", students: 120 },
    { month: "Feb", students: 180 },
    { month: "Mar", students: 250 },
    { month: "Apr", students: 320 },
    { month: "May", students: 420 },
    { month: "Jun", students: 500 },
  ];
  const coursePerformance = [
    { course: "React Dev", completion: 85 },
    { course: "Python", completion: 92 },
    { course: "Web Dev", completion: 78 },
    { course: "Data Science", completion: 88 },
  ];
  const recentActivities = [
    { text: 'New enrollment in "React Development"', time: "5 hours ago" },
    { text: "Quiz completed by 23 students", time: "5 hours ago" },
    { text: 'New discussion in "Python Basics"', time: "5 hours ago" },
    {
      text: 'Course "Web Development" reached 100 students',
      time: "5 hours ago",
    },
  ];
  return (
    <div className="instructor-layout">
      <SidebarInstructor />
      <div className="instructor-dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Instructor Dashboard</h1>
            <p>Welcome back, Instructor</p>
          </div>
          <button className="logout-btn">Logout</button>
        </div>
        <div className="stats-grid">
          {stats.map((item, index) => {
            const Icon = item.icon;
            return (
              <div className="stat-card" key={index}>
                <div className="stat-icon">
                  <Icon size={22} />
                </div>
                <div>
                  <p className="stat-title">{item.title}</p>
                  <p className="stat-value">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-header">
              <TrendingUp size={20} />
              <h3>Student Enrollment</h3>
            </div>
            <div className="bar-chart">
              {enrollmentData.map((data, index) => (
                <div className="bar-item" key={index}>
                  <div
                    className="bar"
                    style={{ height: `${(data.students / 500) * 100}%` }}
                  ></div>
                  <span className="bar-label">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-card">
            <div className="chart-header">
              <BarChart3 size={20} />
              <h3>Course Performance</h3>
            </div>
            {coursePerformance.map((course, index) => (
              <div className="progress-row" key={index}>
                <div className="progress-info">
                  <span>{course.course}</span>
                  <span>{course.completion}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${course.completion}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="activity-card">
          <h3>Recent Activity</h3>

          {recentActivities.map((activity, index) => (
            <div className="activity-item" key={index}>
              <span className="dot"></span>
              <div>
                <p>{activity.text}</p>
                <small>{activity.time}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
