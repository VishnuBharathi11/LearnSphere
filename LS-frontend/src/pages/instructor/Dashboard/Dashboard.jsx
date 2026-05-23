import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Users,
  Star,
  DollarSign,
  TrendingUp,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
} from "recharts";
import "./Dashboard.scss";
import { getInstructorCourses } from "../../../services/courseApi";
import { getEnrollmentsByCourses } from "../../../services/enrollmentApi";
import { getCurrentUser } from "../../../services/userProfileStore.js";

function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = useMemo(() => {
    try {
      return getCurrentUser();
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

  const { stats, trendData, coursePerformance, recentActivities } = useMemo(() => {
    const totalCourses = courses.length;
    const courseIdSet = new Set(courses.map((c) => String(c.id)));
    const scopedEnrollments = enrollments.filter((e) => courseIdSet.has(String(e.courseId)));
    const totalStudents = scopedEnrollments.length;

    const avgRatingRaw =
      courses.length === 0
        ? 0
        : courses.reduce((sum, c) => sum + (Number(c.rating) || 0), 0) / courses.length;

    const totalRevenue = scopedEnrollments.reduce((sum, e) => {
      const course = courses.find((c) => String(c.id) === String(e.courseId));
      return sum + (Number(course?.price) || 0);
    }, 0);

    const stats = [
      { title: "Total Courses", value: totalCourses, icon: BookOpen, color: "blue" },
      { title: "Total Students", value: totalStudents, icon: Users, color: "yellow" },
      { title: "Avg Rating", value: totalCourses === 0 ? "0.0" : avgRatingRaw.toFixed(1), icon: Star, color: "green" },
      { title: "Revenue", value: `Rs ${Math.round(totalRevenue).toLocaleString()}`, icon: DollarSign, color: "red" },
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
    const trendData = Array.from({ length: 6 }).map((_, idx) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const enroll = monthMap[key] || 0;
      return {
        month: date.toLocaleString("default", { month: "short" }),
        students: enroll,
        revenue: enroll * Math.max(1, Math.round(totalRevenue / Math.max(totalStudents, 1))),
      };
    });

    const coursePerformance = courses.slice(0, 7).map((course) => {
      const enrollmentCount = scopedEnrollments.filter((e) => String(e.courseId) === String(course.id)).length;
      const score = Math.min(100, Math.max(8, Math.round((Number(course.rating) || 0) * 14 + enrollmentCount * 2)));
      return {
        course: course.courseName,
        score,
      };
    });

    const recentActivities = [...courses]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5)
      .map((course) => ({
        text: `${course.courseName} is ${String(course.status || "DRAFT").toLowerCase()}`,
        time: course.createdAt ? new Date(course.createdAt).toLocaleDateString() : "-",
      }));

    return { stats, trendData, coursePerformance, recentActivities };
  }, [courses, enrollments]);

  const averagePerformance = useMemo(() => {
    if (!coursePerformance.length) return 0;
    const total = coursePerformance.reduce((sum, item) => sum + (Number(item.score) || 0), 0);
    return Math.round(total / coursePerformance.length);
  }, [coursePerformance]);

  if (loading) {
    return null;
  }

  return (
    <div className="instructor-dashboard-layout">
      <div className="instructor-dashboard">
        <div className="dashboard-hero">
          <div className="hero-welcome">
            <span className="hero-eyebrow">Instructor Suite</span>
            <h1>Welcome back, {currentUser?.name || "Instructor"}</h1>
            <p>
              Monitor your academy growth, examine recent course enrollments, evaluate student 
              discussion threads, and control your online classroom materials.
            </p>
          </div>
        </div>

        <div className="status-grid">
          {stats.map((item, index) => {
            const Icon = item.icon;
            return (
              <div className={`status-card status-${item.color}`} key={index}>
                <div className="status-icon">
                  <Icon size={22} strokeWidth={2} />
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
                <TrendingUp size={20} strokeWidth={2.2} />
                <h3>Enrollment Growth</h3>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="enrollFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A435F0" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#A435F0" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 500, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fontWeight: 500, fill: "#64748b" }} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="students" stroke="#A435F0" fill="url(#enrollFill)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-title">
                <Activity size={20} strokeWidth={2.2} />
                <h3>Course Performance Index</h3>
              </div>
            </div>
            {coursePerformance.length <= 1 ? (
              <div className="single-performance-wrap">
                <ResponsiveContainer width="100%" height={250}>
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="92%"
                    startAngle={210}
                    endAngle={-30}
                    data={[
                      { name: "score", value: averagePerformance, fill: "#A435F0" },
                      { name: "remaining", value: 100 - averagePerformance, fill: "#e5eef8" },
                    ]}
                  >
                    <RadialBar dataKey="value" cornerRadius={12} />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
                <p className="single-performance-label">
                  {coursePerformance[0]?.course || "No course yet"}: {averagePerformance}/100
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={coursePerformance} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" />
                  <XAxis
                    dataKey="course"
                    tick={{ fontSize: 10, fontWeight: 500, fill: "#64748b" }}
                    tickFormatter={(value) => (value.length > 15 ? `${value.substring(0, 12)}...` : value)}
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fontWeight: 500, fill: "#64748b" }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]} fill="#A435F0" barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="activity-card">
          <h3>Recent Activity</h3>
          {recentActivities.length === 0 ? (
            <p className="activity-empty">No recent course activities found.</p>
          ) : (
            <div className="activity-list">
              {recentActivities.map((activity, index) => (
                <div className="activity-item" key={index}>
                  <span className="dot"></span>
                  <div className="activity-details">
                    <p>{activity.text}</p>
                    <small>{activity.time}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
