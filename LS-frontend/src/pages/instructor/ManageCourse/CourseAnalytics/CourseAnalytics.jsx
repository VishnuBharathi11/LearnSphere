import React, { useMemo } from "react";
import "./CourseAnalytics.scss";
import { DollarSign, Users, Star, MessageSquare } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import { useParams } from "react-router-dom";
import SidebarInstructor from "../../../../components/SideBar-I/SidebarInstructor";

function CourseAnalytics() {
  const { courseId } = useParams();
  const id = String(courseId);

  const {
    totalRevenue,
    totalEnrollments,
    avgRating,
    reviewCount,
    enrollmentData,
    revenueData,
    completionData,
    lessons,
  } = useMemo(() => {
    const courses =
      JSON.parse(localStorage.getItem("courses")) || [];
    const enrolled =
      JSON.parse(localStorage.getItem("enrolledCourses")) || [];
    const ratings =
      JSON.parse(localStorage.getItem("courseRatings")) || [];
    const lessonMap =
      JSON.parse(localStorage.getItem("courseLessons")) || {};

    const course = courses.find(
      (c) => String(c.id) === id
    );

    if (!course) {
      return {
        totalRevenue: 0,
        totalEnrollments: 0,
        avgRating: 0,
        reviewCount: 0,
        enrollmentData: [],
        revenueData: [],
        completionData: [],
        lessons: [],
      };
    }

    const courseEnrollments = enrolled.filter(
      (e) => String(e.courseId) === id
    );

    const totalEnrollments = courseEnrollments.length;
    const totalRevenue =
      totalEnrollments * course.price;

    const courseRatings = ratings.filter(
      (r) => String(r.courseId) === id
    );

    const avgRating =
      courseRatings.length === 0
        ? 0
        : (
            courseRatings.reduce(
              (s, r) => s + r.rating,
              0
            ) / courseRatings.length
          ).toFixed(1);

    const reviewCount = courseRatings.length;

    // 📊 Enrollment & revenue trend
    const monthMap = {};

    courseEnrollments.forEach((e) => {
      if (!e.enrolledAt) return;
      const month = new Date(e.enrolledAt).toLocaleString(
        "default",
        { month: "short" }
      );
      monthMap[month] = (monthMap[month] || 0) + 1;
    });

    const enrollmentData = Object.keys(monthMap).map(
      (m) => ({
        month: m,
        value: monthMap[m],
      })
    );

    const revenueData = enrollmentData.map((d) => ({
      month: d.month,
      value: d.value * course.price,
    }));

    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;

    courseEnrollments.forEach((e) => {
      if (e.completedLessons === 0) notStarted++;
      else if (e.completedLessons === e.totalLessons)
        completed++;
      else inProgress++;
    });

    const completionData = [
      { name: "Completed", value: completed },
      { name: "In Progress", value: inProgress },
      { name: "Not Started", value: notStarted },
    ];

    // 📘 Lesson engagement
    const courseLessons = lessonMap[id] || [];
    const lessons = courseLessons.map((l) => ({
      name: l.title,
      value:
        totalEnrollments === 0
          ? 0
          : Math.floor(
              (courseEnrollments.reduce(
                (sum, e) =>
                  sum +
                  Math.min(
                    e.completedLessons,
                    courseLessons.length
                  ),
                0
              ) /
                (totalEnrollments *
                  courseLessons.length)) *
                100
            ),
    }));

    return {
      totalRevenue,
      totalEnrollments,
      avgRating,
      reviewCount,
      enrollmentData,
      revenueData,
      completionData,
      lessons,
    };
  }, [id]);

  const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

  return (
    <div className="analytics-layout">

      <div className="analytics-page">
        <h1 className="analytics-title">Course Analytics</h1>

        {/* STATS */}
        <div className="analytics-stats-grid">
          <div className="analytics-stat-card revenue">
            <div className="stat-icon green">
              <DollarSign size={22} />
            </div>
            <p>Total Revenue</p>
            <h2>₹{totalRevenue.toLocaleString()}</h2>
          </div>

          <div className="analytics-stat-card enroll">
            <div className="stat-icon blue">
              <Users size={22} />
            </div>
            <p>Total Enrollments</p>
            <h2>{totalEnrollments}</h2>
          </div>

          <div className="analytics-stat-card rating">
            <div className="stat-icon yellow">
              <Star size={22} />
            </div>
            <p>Avg. Rating</p>
            <h2>{avgRating}</h2>
          </div>

          <div className="analytics-stat-card reviews">
            <div className="stat-icon purple">
              <MessageSquare size={22} />
            </div>
            <p>Total Reviews</p>
            <h2>{reviewCount}</h2>
          </div>
        </div>

        {/* CHARTS */}
        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>Enrollment Trend</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={enrollmentData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
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
                <Bar dataKey="value" fill="#22c55e" />
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
                >
                  {completionData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="analytics-card">
            <h3>Lesson Engagement</h3>
            {lessons.length === 0 ? (
              <p>No lesson data</p>
            ) : (
              lessons.map((l, i) => (
                <div className="lesson-row" key={i}>
                  <span>{l.name}</span>
                  <div className="analytics-progress">
                    <div
                      className="analytics-progress-fill"
                      style={{
                        width: `${l.value}%`,
                      }}
                    ></div>
                  </div>
                  <small>{l.value}%</small>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseAnalytics;
