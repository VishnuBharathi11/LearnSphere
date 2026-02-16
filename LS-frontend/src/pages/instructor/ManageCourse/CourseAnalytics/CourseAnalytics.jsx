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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useParams } from "react-router-dom";

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
    unauthorized,
  } = useMemo(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
    const courses = JSON.parse(localStorage.getItem("courses")) || [];
    const enrolled = JSON.parse(localStorage.getItem("enrolledCourses")) || [];
    const ratings = JSON.parse(localStorage.getItem("courseRatings")) || [];
    const lessonMap = JSON.parse(localStorage.getItem("courseLessons")) || {};

    const course = courses.find(
      (c) => String(c.id) === id && c.instructorId === currentUser.id,
    );

    if (!course) {
      return { unauthorized: true };
    }

    const courseEnrollments = enrolled.filter((e) => String(e.courseId) === id);

    const totalEnrollments = courseEnrollments.length;
    const price = Number(course.price) || 0;
    const totalRevenue = totalEnrollments * price;

    const courseRatings = ratings.filter((r) => String(r.courseId) === id);

    const avgRating =
      courseRatings.length === 0
        ? 0
        : (
            courseRatings.reduce((s, r) => s + (Number(r.rating) || 0), 0) /
            courseRatings.length
          ).toFixed(1);
    const reviewCount = courseRatings.length;

    const monthMap = {};
    courseEnrollments.forEach((e) => {
      if (!e.enrolledAt) return;
      const month = new Date(e.enrolledAt).toLocaleString("default", {
        month: "short",
      });
      monthMap[month] = (monthMap[month] || 0) + 1;
    });

    const enrollmentData = Object.keys(monthMap).map((m) => ({
      month: m,
      value: monthMap[m],
    }));
    const revenueData = enrollmentData.map((d) => ({
      month: d.month,
      value: d.value * course.price,
    }));

    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;

    courseEnrollments.forEach((e) => {
      const done = Number(e.completedLessons) || 0;
      const total = Number(e.totalLessons) || 0;
      if (total === 0 || done === 0) notStarted++;
      else if (done >= total) completed++;
      else inProgress++;
    });

    const completionData = [
      { name: "Completed", value: completed },
      { name: "In Progress", value: inProgress },
      { name: "Not Started", value: notStarted },
    ];

    const courseLessons = lessonMap[id] || [];
    const lessons =
      courseLessons.length === 0
        ? []
        : courseLessons.map((l) => {
            const totalProgress = courseEnrollments.reduce((sum, e) => {
              const done = Number(e.completedLessons) || 0;
              return sum + Math.min(done, courseLessons.length);
            }, 0);
            const percentage =
              totalEnrollments === 0
                ? 0
                : Math.floor(
                    (totalProgress /
                      (totalEnrollments * courseLessons.length)) *
                      100,
                  );
            return { name: l.title, value: percentage };
          });

    return {
      totalRevenue,
      totalEnrollments,
      avgRating,
      reviewCount,
      enrollmentData,
      revenueData,
      completionData,
      lessons,
      unauthorized: false,
    };
  }, [id]);

  const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];
  if (unauthorized) {
    return <p style={{ padding: 40 }}>Unauthorized access to analytics.</p>;
  }
  return (
    <div className="analytics-layout">
      <div className="analytics-page">
        {/* <p>Course ID: {id}</p> */}
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

        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>Enrollment Trend</h3>
            {enrollmentData.length === 0 ? (
              <p>No enrollment data</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={enrollmentData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="analytics-card">
            <h3>Revenue Trend</h3>
            {revenueData.length === 0 ? (
              <p>No revenue data</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={revenueData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            )}
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
