import React, { useMemo } from "react";
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
  const { stats, enrollmentData, coursePerformance, recentActivities } =
    useMemo(() => {
      const instructorCourses =
        JSON.parse(localStorage.getItem("instructorCourses")) || [];
      const enrolledCourses =
        JSON.parse(localStorage.getItem("enrolledCourses")) || [];
      const ratings = JSON.parse(localStorage.getItem("courseRatings")) || [];
      const totalCourses = instructorCourses.length;
      const totalStudents = enrolledCourses.filter((ec) =>
        instructorCourses.some((c) => c.id === ec.courseId),
      ).length;
      const totalRevenue = enrolledCourses.reduce((sum, ec) => {
        const course = instructorCourses.find((c) => c.id === ec.courseId);
        return course ? sum + course.price : sum;
      }, 0);
      const avgRating =
        ratings.length === 0
          ? 0
          : (
              ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            ).toFixed(1);
      const stats = [
        {
          title: "Total Courses",
          value: totalCourses,
          icon: BookOpen,
          color: "blue",
        },
        {
          title: "Total Students",
          value: totalStudents,
          icon: Users,
          color: "yellow",
        },
        { title: "Avg. Rating", value: avgRating, icon: Star, color: "green" },
        {
          title: "Revenue",
          value: `₹${totalRevenue}`,
          icon: DollarSign,
          color: "red",
        },
      ];
      const monthMap = {};
      enrolledCourses.forEach((ec) => {
        if (!ec.enrolledAt) return;
        const date = new Date(ec.enrolledAt);
        const month = date.toLocaleString("default", { month: "short" });
        monthMap[month] = (monthMap[month] || 0) + 1;
      });
      const enrollmentData = Object.keys(monthMap).map((month) => ({
        month,
        students: monthMap[month],
      }));
      const coursePerformance = instructorCourses.map((course) => {
        const courseEnrollments = enrolledCourses.filter(
          (ec) => ec.courseId === course.id,
        );
        const completed = courseEnrollments.filter(
          (ec) => ec.completedLessons === ec.totalLessons,
        ).length;
        const completion =
          courseEnrollments.length === 0
            ? 0
            : Math.floor((completed / courseEnrollments.length) * 100);
        return {
          course: course.courseName,
          completion,
        };
      });
      const recentActivities = enrolledCourses
        .slice(-5)
        .reverse()
        .map((ec) => {
          const course = instructorCourses.find((c) => c.id === ec.courseId);
          return {
            text: `New enrollment in "${course?.courseName}"`,
            time: "Recently",
          };
        });
      return {
        stats,
        enrollmentData,
        coursePerformance,
        recentActivities,
      };
    }, []);
  return (
    <div className="instructor-layout">
      <div className="instructor-dashboard">
        <div className="i-dashboard-header">
          <div>
            <h1>Instructor Dashboard</h1>
            <p>Welcome back, Instructor</p>
          </div>
        </div>
        <div className="status-grid">
          {stats.map((item, index) => {
            const Icon = item.icon;
            return (
              <div className={`status-card status-${item.color}`} key={index}>
                <div className="status-icon">
                  <Icon size={22} />
                </div>

                <div className="status-content">
                  <strong>{item.value}</strong>
                  <span>{item.title}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="chart-grid">
          <div className="chart-card">
            <div className="chart-header">
              <TrendingUp size={20} />
              <h3>Student Enrollment (Monthly)</h3>
            </div>
            <div className="bar-chart">
              {enrollmentData.map((data, index) => (
                <div className="bar-item" key={index}>
                  <div
                    className="bar"
                    style={{
                      height: `${Math.min((data.students / 10) * 100, 100)}%`,
                    }}
                  ></div>
                  <span className="bar-value">{data.students}</span>
                  <span className="bar-label">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-card">
            <div className="chart-header">
              <BarChart3 size={20} />
              <h3>Course Completion Rate</h3>
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
          {recentActivities.length === 0 ? (
            <p>No recent activity</p>
          ) : (
            recentActivities.map((activity, index) => (
              <div className="activity-item" key={index}>
                <span className="dot"></span>
                <div>
                  <p>{activity.text}</p>
                  <small>{activity.time}</small>
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
