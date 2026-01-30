import React from "react";
import "./CourseAnalytics.css";
import { DollarSign, Users, Star, MessageSquare, Frown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import SidebarInstructor from "../../../../components/SideBar-I/SidebarInstructor";
function CourseAnalytics() {
  const enrollmentData = [
    { month: "Jan", value: 30 },
    { month: "Feb", value: 45 },
    { month: "Mar", value: 60 },
    { month: "Apr", value: 70 },
    { month: "May", value: 85 },
    { month: "Jun", value: 95 },
  ];
  const revenueData = [
    { month: "Jan", value: 25000 },
    { month: "Feb", value: 40000 },
    { month: "Mar", value: 55000 },
    { month: "Apr", value: 70000 },
    { month: "May", value: 85000 },
    { month: "Jun", value: 100000 },
  ];
  const completionData = [
    { name: "Completed", value: 84 },
    { name: "In Progress", value: 12 },
    { name: "Not Started", value: 4 },
  ];
  const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];
  const lessons = [
    { name: "Intro", value: 95 },
    { name: "Components", value: 88 },
    { name: "State", value: 82 },
    { name: "Hooks", value: 76 },
    { name: "Router", value: 68 },
  ];
  return (
    <div className="analytics-layout">
        <SidebarInstructor/>
        <div className="analytics-page">
      <h1 className="analytics-title">Course Analytics</h1>
      <div className="analytics-stats-grid">
        <div className="analytics-stat-card revenue">
          <div className="stat-icon green">
            <DollarSign size={22} />
          </div>
          <p>Total Revenue</p>
          <h2>₹1,54,500</h2>
        </div>
        <div className="analytics-stat-card enroll">
          <div className="stat-icon blue">
            <Users size={22} />
          </div>
          <p>Total Enrollments</p>
          <h2>189</h2>
        </div>
        <div className="analytics-stat-card rating">
          <div className="stat-icon yellow">
            <Star size={22} />
          </div>
          <p>Avg. Rating</p>
          <h2>4.8</h2>
        </div>
        <div className="analytics-stat-card reviews">
          <div className="stat-icon purple">
            <MessageSquare size={22} />
          </div>
          <p>Total Reviews</p>
          <h2>47</h2>
        </div>
      </div>
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Enrollment Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={enrollmentData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="analytics-card">
          <h3>Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="analytics-card completion-card">
          <h3>Student Completion Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={completionData}
                dataKey="value"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={3}
              >
                {completionData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="completion-center">
            <h2>84%</h2>
            <p>Completed</p>
          </div>
          <div className="legend">
            <span>
              <i className="dot green"></i> Completed (84%)
            </span>
            <span>
              <i className="dot yellow"></i> In Progress (12%)
            </span>
            <span>
              <i className="dot red"></i> Not Started (4%)
            </span>
          </div>
        </div>
        <div className="analytics-card">
          <h3>Lesson Engagement</h3>
          {lessons.map((l, i) => (
            <div className="lesson-row" key={i}>
              <span>{l.name}</span>
              <div className="analytics-progress">
                <div
                  className="analytics-progress-fill"
                  style={{ width: `${l.value}%` }}
                ></div>
              </div>
              <small>{l.value}%</small>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}

export default CourseAnalytics;
