import "./AdminDashboard.scss";
import { Users, GraduationCap, BookOpen, IndianRupee, AlertCircle, Clock, TrendingUp, Sparkles } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import { getAdminDashboard } from "../../../services/adminApi";
import { getAdminCourses } from "../../../services/courseApi";
import { getFriendlyErrorMessage } from "../../../services/apiError";
import { getCurrentUser } from "../../../services/userProfileStore.js";

function AdminDashboard() {
  const currentUser = getCurrentUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") return;

    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [dashboardData, adminCourses] = await Promise.all([
          getAdminDashboard(),
          getAdminCourses(),
        ]);
        if (!active) return;
        setDashboard(dashboardData || null);
        setCourses(Array.isArray(adminCourses) ? adminCourses : []);
      } catch (apiError) {
        if (!active) return;
        setError(getFriendlyErrorMessage(apiError, "Failed to load dashboard analytics"));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [currentUser?.role]);

  const activeCourses = useMemo(
    () => courses.filter((course) => String(course.status || "").toUpperCase() === "PUBLISHED").length,
    [courses]
  );

  const pendingReviewCourses = useMemo(
    () => courses.filter((course) => String(course.status || "").toUpperCase() === "REVIEW").length,
    [courses]
  );

  const categories = useMemo(() => {
    const map = {};
    courses.forEach((course) => {
      const category = course.category || "General";
      map[category] = (map[category] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [courses]);

  const handleCategorySelect = (barData) => {
    const picked = barData?.name || barData?.payload?.name || "";
    if (!picked) return;
    setSelectedCategory(picked);
  };

  const courseNameMap = useMemo(
    () =>
      new Map(
        courses.map((course) => [String(course.id), course.courseName || course.title || String(course.id)])
      ),
    [courses]
  );

  const prettifyActivityMessage = (rawMessage) => {
    let message = String(rawMessage || "");
    courseNameMap.forEach((courseName, courseId) => {
      if (!courseId) return;
      message = message.split(courseId).join(courseName);
    });
    return message;
  };

  const stats = useMemo(
    () => [
      { label: "Active Learners", value: dashboard?.activeLearners || 0, icon: Users, theme: "purple" },
      { label: "Active Instructors", value: dashboard?.activeInstructors || 0, icon: GraduationCap, theme: "gold" },
      { label: "Active Courses", value: activeCourses, icon: BookOpen, theme: "emerald" },
      {
        label: "Platform Revenue",
        value: `INR ${Number(dashboard?.platformRevenue || 0).toLocaleString()}`,
        icon: IndianRupee,
        theme: "gold-glow",
      },
    ],
    [dashboard, activeCourses]
  );

  const pendingTasks = useMemo(() => {
    const fromApi = Array.isArray(dashboard?.pendingTasks) ? dashboard.pendingTasks : [];
    return [
      {
        text: `${pendingReviewCourses} courses pending approval`,
        priority: "high",
      },
      ...fromApi.map((task) => ({
        text: `${task.count} ${task.text}`,
        priority: task.priority || "medium",
      })),
    ];
  }, [dashboard?.pendingTasks, pendingReviewCourses]);

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="admin-access-denied">
        <AlertCircle size={40} />
        <p>Access denied. This page is available only for admin accounts.</p>
      </div>
    );
  }

  if (loading) {
    return null;
  }

  return (
    <div className="admin-dashboard-layout">
      <div className="admin-dashboard">
        <header className="dashboard-header">
          <div>
            <h1>Dashboard Overview</h1>
            <p>Welcome back, Admin. Here is the operational status of LearnSphere.</p>
          </div>
          <div className="system-tag">
            <Sparkles size={16} />
            <span>Admin Control Panel</span>
          </div>
        </header>

        {error && <p className="admin-error">{error}</p>}

        <div className="status-grid">
          {stats.map((s) => (
            <div key={s.label} className={`stat-card ${s.theme}`}>
              <div className="icon-wrapper">
                <s.icon size={22} />
              </div>
              <div className="stat-content">
                <p className="stat-value">{s.value}</p>
                <p className="stat-label">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pending-box">
          <h3>
            <AlertCircle size={18} /> Required Operations (Pending Tasks)
          </h3>
          <div className="task-grid">
            {pendingTasks.map((task, idx) => (
              <div key={`${task.text}-${idx}`} className={`task ${task.priority}`}>
                <span>{task.text}</span>
                <span className="badge">{task.priority}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-header">
              <TrendingUp size={16} />
              <h3>User Growth Trends</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={dashboard?.userGrowth || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" stroke="var(--ui-text-muted)" fontSize={11} tickLine={false} />
                  <YAxis allowDecimals={false} stroke="var(--ui-text-muted)" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(28, 29, 31, 0.95)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: "8px",
                      boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Line type="monotone" dataKey="registrations" stroke="#a435f0" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="logins" stroke="#f69c08" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <TrendingUp size={16} />
              <h3>Revenue Performance</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={dashboard?.revenueTrend || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" stroke="var(--ui-text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--ui-text-muted)" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(28, 29, 31, 0.95)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: "8px",
                      boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="grossRevenue" fill="#a435f0" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="commissionRevenue" fill="#f69c08" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <BookOpen size={16} />
              <h3>Catalog Distribution</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={categories} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" stroke="var(--ui-text-muted)" fontSize={11} tickLine={false} />
                  <YAxis allowDecimals={false} stroke="var(--ui-text-muted)" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(28, 29, 31, 0.95)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: "8px",
                      boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="url(#categoryGradient)"
                    radius={[6, 6, 0, 0]}
                    onClick={handleCategorySelect}
                    cursor="pointer"
                  />
                  <defs>
                    <linearGradient id="categoryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a435f0" />
                      <stop offset="100%" stopColor="#f69c08" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
              <p className="selected-category-label">
                {selectedCategory ? `Selected: ${selectedCategory}` : "Click a category bar to target"}
              </p>
            </div>
          </div>
        </div>

        <div className="activity-box">
          <h3>Recent Audit Trail</h3>
          {!dashboard?.recentActivity?.length ? (
            <p className="empty-trail">No recent administrative logs found.</p>
          ) : (
            <ul>
              {dashboard.recentActivity.map((activity, idx) => (
                <li key={`${activity.type}-${idx}`}>
                  <div className="activity-icon">
                    <Clock size={12} />
                  </div>
                  <span className="activity-message">{prettifyActivityMessage(activity.message)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
