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
import { getCourseProgress } from "../../../../services/progressApi";
import { getCurrentUser } from "../../../../services/userProfileStore.js";

function CourseAnalytics() {
  const { courseId } = useParams();
  const id = String(courseId);
  const [course, setCourse] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [discussionCount, setDiscussionCount] = useState(0);
  const [progressByUser, setProgressByUser] = useState({});
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

        const [list, threadData, lessons] = await Promise.all([
          getEnrollmentsByCourse(id),
          listThreads(id, { page: 0, size: 200 }),
          getCourseLessons(id).catch(() => []),
        ]);
        setEnrollments(Array.isArray(list) ? list : []);
        setDiscussionCount(Array.isArray(threadData?.items) ? threadData.items.length : 0);
        setLessonList(Array.isArray(lessons) ? lessons : []);
      } catch {
        setCourse(null);
        setEnrollments([]);
        setDiscussionCount(0);
        setLessonList([]);
      } finally {
        setLoadingCourse(false);
      }
    }
    loadCourse();
  }, [id, userId]);
  const [lessonList, setLessonList] = useState([]);

  useEffect(() => {
    if (!id || enrollments.length === 0) {
      setProgressByUser({});
      return;
    }

    let active = true;
    async function loadProgress() {
      try {
        const results = await Promise.all(
          enrollments.map(async (enrollment) => {
            const userId = String(enrollment.userId || "");
            if (!userId) return [userId, null];
            const progress = await getCourseProgress(userId, id).catch(() => null);
            return [userId, progress];
          })
        );
        if (!active) return;
        setProgressByUser(Object.fromEntries(results.filter(([userId]) => Boolean(userId))));
      } catch {
        if (!active) return;
        setProgressByUser({});
      }
    }

    loadProgress();
    return () => {
      active = false;
    };
  }, [id, enrollments]);

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
    const scoredAssessments = courseEnrollments
      .map((enrollment) => progressByUser[String(enrollment.userId)]?.finalAssessment)
      .filter((assessment) => Number.isFinite(assessment?.score) && Number.isFinite(assessment?.total))
      .map((assessment) => (assessment.score / Math.max(assessment.total, 1)) * 5);
    const avgRating = scoredAssessments.length
      ? (scoredAssessments.reduce((sum, value) => sum + value, 0) / scoredAssessments.length).toFixed(1)
      : "0.0";

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
      const userProgress = progressByUser[String(e.userId)] || null;
      const completedLessons = Array.isArray(userProgress?.completedLessonIds)
        ? userProgress.completedLessonIds.length
        : 0;
      const percent =
        lessonList.length > 0 ? Math.min(100, Math.round((completedLessons / lessonList.length) * 100)) : 0;
      if (percent >= 100 || String(e.status || "").toUpperCase() === "COMPLETED") completed += 1;
      else if (percent > 0 || String(e.status || "").toUpperCase() === "ACTIVE") inProgress += 1;
      else notStarted += 1;
    });

    const completionData = [
      { name: "Completed", value: completed },
      { name: "In Progress", value: inProgress },
      { name: "Not Started", value: notStarted },
    ];

    const lessons = (Array.isArray(lessonList) ? lessonList : []).map((lesson, idx) => {
      const completedCount = courseEnrollments.reduce((sum, enrollment) => {
        const completedIds = progressByUser[String(enrollment.userId)]?.completedLessonIds;
        const done = Array.isArray(completedIds) && completedIds.includes(String(lesson.id));
        return sum + (done ? 1 : 0);
      }, 0);
      const value = totalEnrollments > 0 ? Math.round((completedCount / totalEnrollments) * 100) : 0;
      return {
        name: lesson.title || `Lesson ${idx + 1}`,
        value,
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
  }, [id, course, enrollments, lessonList, progressByUser]);

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
            <div className="stat-content">
              <h2>Rs {totalRevenue.toLocaleString()}</h2>
              <p>Total Revenue</p>
            </div>
          </div>

          <div className="analytics-stat-card enroll">
            <div className="stat-icon blue"><Users size={22} /></div>
            <div className="stat-content">
              <h2>{totalEnrollments}</h2>
              <p>Total Enrollments</p>
            </div>
          </div>

          <div className="analytics-stat-card rating">
            <div className="stat-icon yellow"><Star size={22} /></div>
            <div className="stat-content">
              <h2>{avgRating}</h2>
              <p>Avg. Rating</p>
            </div>
          </div>

          <div className="analytics-stat-card reviews">
            <div className="stat-icon purple"><MessageSquare size={22} /></div>
            <div className="stat-content">
              <h2>{discussionCount}</h2>
              <p>Discussions</p>
            </div>
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
            <p>Completion ratio for each lesson based on learner progress data.</p>
            {lessons.length === 0 ? (
              <p>No lesson engagement data.</p>
            ) : (
              lessons.map((l, i) => (
                <div className="lesson-row" key={i}>
                  <span>{l.name}</span>
                  <div className="analytics-progress">
                    <div className="analytics-progress-fill" style={{ width: `${l.value}%` }}></div>
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

