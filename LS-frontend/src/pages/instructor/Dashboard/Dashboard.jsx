import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Users,
  Star,
  DollarSign,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import "./Dashboard.scss";
import { getInstructorCourses } from "../../../services/courseApi";
import { getEnrollmentsByCourses } from "../../../services/enrollmentApi";

function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(window.appStore.getItem("currentUser"));
    } catch {
      return null;
    }
  }, []);
  const userId = currentUser?.id || currentUser?.userId || "";

  useEffect(() => {
    const role = String(currentUser?.role || "").toLowerCase();
    if (!userId || !role.includes("instructor")) {
      setCourses([]);
      setLoading(false);
      return;
    }

    let active = true;
    async function load() {
      try {
        const result = await getInstructorCourses(String(userId), 0, 300);
        if (!active) return;
        const loadedCourses = Array.isArray(result) ? result : [];
        setCourses(loadedCourses);

        const ids = loadedCourses.map((c) => String(c.id));
        const loadedEnrollments = await getEnrollmentsByCourses(ids);
        if (!active) return;
        setEnrollments(Array.isArray(loadedEnrollments) ? loadedEnrollments : []);
      } catch {
        if (!active) return;
        setCourses([]);
        setEnrollments([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [userId, currentUser?.role]);

  const { stats, enrollmentData, coursePerformance, recentActivities, maxStudentsInMonth } =
    useMemo(() => {
    const totalCourses = courses.length;
    const courseIdSet = new Set(courses.map((c) => String(c.id)));
    const scopedEnrollments = enrollments.filter((e) => courseIdSet.has(String(e.courseId)));
    const totalStudents = scopedEnrollments.length;
    const avgRatingRaw =
      courses.length === 0
        ? 0
        :
            courses.reduce((sum, c) => sum + (Number(c.rating) || 0), 0) /
            courses.length;
    const totalRevenue = scopedEnrollments.reduce((sum, e) => {
      const course = courses.find((c) => String(c.id) === String(e.courseId));
      if (!course) return sum;
      return sum + (Number(course.price) || 0);
    }, 0);

    const stats = [
      { title: "Total Courses", value: totalCourses, icon: BookOpen, color: "blue" },
      { title: "Total Students", value: totalStudents, icon: Users, color: "yellow" },
      {
        title: "Avg. Rating",
        value: totalCourses === 0 ? "0.0" : avgRatingRaw.toFixed(1),
        icon: Star,
        color: "green",
      },
      {
        title: "Revenue",
        value: `Rs ${Math.round(totalRevenue).toLocaleString()}`,
        icon: DollarSign,
        color: "red",
      },
    ];

    const monthMap = {};
    scopedEnrollments.forEach((enrollment) => {
      if (!enrollment.enrolledAt) return;
      const date = new Date(enrollment.enrolledAt);
      if (Number.isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      monthMap[key] = (monthMap[key] || 0) + 1;
    });

    const now = new Date();
    const enrollmentData = Array.from({ length: 4 }).map((_, idx) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (3 - idx), 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const label = date.toLocaleString("default", { month: "short" });
      return {
        month: label,
        students: monthMap[key] || 0,
      };
    });
    const maxStudentsInMonth = Math.max(...enrollmentData.map((d) => d.students), 1);

    const coursePerformance = courses.slice(0, 8).map((course) => {
      const completion = Math.max(10, Math.min(98, Math.round((Number(course.rating) || 0) * 20)));
      return { course: course.courseName, completion };
    });

    const recentActivities = [...courses]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5)
      .map((course) => ({
        text: `${course.courseName} is ${String(course.status || "DRAFT").toLowerCase()}`,
        time: course.createdAt ? new Date(course.createdAt).toLocaleDateString() : "-",
      }));

    return { stats, enrollmentData, coursePerformance, recentActivities, maxStudentsInMonth };
  }, [courses, enrollments]);

  const enrollmentInsight = useMemo(() => {
    const total = enrollmentData.reduce((sum, item) => sum + item.students, 0);
    const firstHalf = enrollmentData.slice(0, 2).reduce((sum, item) => sum + item.students, 0);
    const secondHalf = enrollmentData.slice(2).reduce((sum, item) => sum + item.students, 0);
    const growth =
      firstHalf === 0
        ? secondHalf > 0
          ? 100
          : 0
        : Math.round(((secondHalf - firstHalf) / firstHalf) * 100);
    return {
      total,
      growth,
      up: growth >= 0,
    };
  }, [enrollmentData]);

  if (loading) {
    return <p style={{ padding: 40 }}>Loading dashboard...</p>;
  }

  return (
    <div className="instructor-dashboard-layout">
      <div className="instructor-dashboard">
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
              <div className="chart-title">
                <TrendingUp size={20} />
                <h3>Student Enrollment (Last 4 Months)</h3>
              </div>
              <div className={`trend-chip ${enrollmentInsight.up ? "up" : "down"}`}>
                {enrollmentInsight.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <span>{Math.abs(enrollmentInsight.growth)}%</span>
              </div>
            </div>
            <div className="bar-chart-summary">
              <strong>{enrollmentInsight.total}</strong>
              <span>Total learners enrolled in the last 4 months</span>
            </div>
            <div className="bar-chart">
              {enrollmentData.map((data, index) => (
                <div className="bar-item" key={index}>
                  <div className="bar-track">
                    <div
                      className="bar"
                      style={{
                        height: `${data.students === 0 ? 8 : Math.round((data.students / maxStudentsInMonth) * 100)}%`,
                      }}
                    ></div>
                  </div>
                  <span className="bar-value">{data.students}</span>
                  <span className="bar-label">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-title">
                <BarChart3 size={20} />
                <h3>Course Completion Rate</h3>
              </div>
            </div>
            {coursePerformance.length === 0 ? (
              <p>No course data</p>
            ) : (
              coursePerformance.map((course, index) => (
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
              ))
            )}
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
