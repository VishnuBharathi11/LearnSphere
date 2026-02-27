import React, { useEffect, useMemo, useState } from "react";
import "./CourseAnalytics.scss";
import { DollarSign, Users, Star, MessageSquare, Activity } from "lucide-react";
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
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { useParams } from "react-router-dom";
import { getCourseById, getCourseLessons, getInstructorCourses } from "../../../../services/courseApi";
import { getEnrollmentsByCourse } from "../../../../services/enrollmentApi";
import { listThreads } from "../../../../services/discussionApi";
import { getCurrentUser } from "../../../../services/userProfileStore.js";

function CourseAnalytics() {
  const { courseId } = useParams();
  const id = String(courseId);
  const [course, setCourse] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [discussionCount, setDiscussionCount] = useState(0);
  const currentUser = getCurrentUser() || {};
  const userId = currentUser?.id || currentUser?.userId || "";
  const currentRole = String(currentUser?.role || "").toLowerCase();
  const isInstructorRole = currentRole.includes("instructor");

  useEffect(() => {
    async function loadCourse() {
      try {
        let selectedCourse = null;

        if (userId) {
          let myCourses = [];
          try {
            myCourses = await getInstructorCourses(String(userId), 0, 300);
          } catch {
            myCourses = [];
          }
          selectedCourse =
            (Array.isArray(myCourses) ? myCourses : []).find(
              (courseItem) => String(courseItem.id) === id
            ) || null;
        }

        if (!selectedCourse) {
          selectedCourse = await getCourseById(id);
        }

        setCourse(selectedCourse || null);

        const [list, threadData] = await Promise.all([
          getEnrollmentsByCourse(id),
          listThreads(id, { page: 0, size: 200 }),
        ]);
        setEnrollments(Array.isArray(list) ? list : []);
        setDiscussionCount(Array.isArray(threadData?.items) ? threadData.items.length : 0);
      } catch {
        setCourse(null);
        setEnrollments([]);
        setDiscussionCount(0);
      } finally {
        setLoadingCourse(false);
      }
    }
    loadCourse();
  }, [id, userId]);

  const [lessonList, setLessonList] = useState([]);

  useEffect(() => {
    async function loadLessons() {
      try {
        const list = await getCourseLessons(id);
        setLessonList(Array.isArray(list) ? list : []);
      } catch {
        setLessonList([]);
      }
    }
    loadLessons();
  }, [id]);

  const {
    totalRevenue,
    totalEnrollments,
    avgRating,
    enrollmentData,
    revenueData,
    completionData,
    lessons,
  } = useMemo(() => {
    if (!course) {
      return {
        totalRevenue: 0,
        totalEnrollments: 0,
        avgRating: "0.0",
        enrollmentData: [],
        revenueData: [],
        completionData: [],
        lessons: [],
      };
    }

    const courseEnrollments = enrollments.filter((e) => String(e.courseId) === id);

    const totalEnrollments = courseEnrollments.length;
    const price = Number(course.price) || 0;
    const totalRevenue = totalEnrollments * price;
    const avgRating = Number(course.rating || 0).toFixed(1);

    const monthMap = {};
    courseEnrollments.forEach((e) => {
      if (!e.enrolledAt) return;
      const stamp = new Date(e.enrolledAt);
      if (Number.isNaN(stamp.getTime())) return;
      const key = `${stamp.getFullYear()}-${stamp.getMonth()}`;
      monthMap[key] = (monthMap[key] || 0) + 1;
    });

    const now = new Date();
    const enrollmentData = Array.from({ length: 6 }).map((_, idx) => {
      const stamp = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      const key = `${stamp.getFullYear()}-${stamp.getMonth()}`;
      return {
        month: stamp.toLocaleString("default", { month: "short" }),
        value: monthMap[key] || 0,
      };
    });
    const revenueData = enrollmentData.map((d) => ({
      month: d.month,
      value: d.value * price,
    }));

    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;

    courseEnrollments.forEach((e) => {
      const normalized = String(e.status || "").toUpperCase();
      if (normalized === "COMPLETED") completed += 1;
      else if (normalized === "ACTIVE") inProgress += 1;
      else notStarted += 1;
    });

    const completionData = [
      { name: "Completed", value: completed },
      { name: "In Progress", value: inProgress },
      { name: "Not Started", value: notStarted },
    ];

    const merged = Array.isArray(lessonList) ? lessonList : [];
    const lessonCount = merged.length;
    const base = totalEnrollments === 0 ? 1 : totalEnrollments;
    const lessons = (lessonCount > 0 ? merged : Array.from({ length: 5 }).map((_, i) => ({ title: `Lesson ${i + 1}` }))).map((l, idx) => {
      const dropFactor = 100 - idx * Math.min(18, Math.max(8, Math.floor(80 / Math.max(lessonCount, 1))));
      const engagement = Math.max(12, Math.min(98, dropFactor - Math.floor((idx * base) / Math.max(1, lessonCount))));
      return {
        name: l.title || `Lesson ${idx + 1}`,
        value: engagement,
      };
    });

    return {
      totalRevenue,
      totalEnrollments,
      avgRating,
      enrollmentData,
      revenueData,
      completionData,
      lessons,
    };
  }, [id, course, enrollments, lessonList]);

  const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

  if (loadingCourse) {
    return <p style={{ padding: 40 }}>Loading analytics...</p>;
  }
  if (!isInstructorRole) {
    return <p style={{ padding: 40 }}>Access denied. Analytics is available only for instructor accounts.</p>;
  }
  if (!course) {
    return <p style={{ padding: 40 }}>Unable to load analytics for this course right now.</p>;
  }

  return (
    <div className="analytics-layout">
      <div className="analytics-page">
        <div className="analytics-stats-grid">
          <div className="analytics-stat-card revenue">
            <div className="stat-icon green"><DollarSign size={22} /></div>
            <p>Total Revenue</p>
            <h2>Rs {totalRevenue.toLocaleString()}</h2>
          </div>

          <div className="analytics-stat-card enroll">
            <div className="stat-icon blue"><Users size={22} /></div>
            <p>Total Enrollments</p>
            <h2>{totalEnrollments}</h2>
          </div>

          <div className="analytics-stat-card rating">
            <div className="stat-icon yellow"><Star size={22} /></div>
            <p>Avg. Rating</p>
            <h2>{avgRating}</h2>
          </div>

          <div className="analytics-stat-card reviews">
            <div className="stat-icon purple"><MessageSquare size={22} /></div>
            <p>Discussions</p>
            <h2>{discussionCount}</h2>
          </div>
        </div>

        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>Enrollment Trend</h3>
            {enrollmentData.length === 0 ? (
              <p>No enrollment data</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
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
                  <Bar dataKey="value" fill="#22c55e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="analytics-card completion-card">
            <h3>Student Completion Status</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={completionData} dataKey="value" innerRadius={70} outerRadius={100}>
                  {completionData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="analytics-card">
            <h3>Lesson Engagement</h3>
            <p>Estimated completion trend by lesson sequence.</p>
            {lessons.map((l, i) => (
              <div className="lesson-row" key={i}>
                <span>{l.name}</span>
                <div className="analytics-progress">
                  <div className="analytics-progress-fill" style={{ width: `${l.value}%` }}></div>
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

