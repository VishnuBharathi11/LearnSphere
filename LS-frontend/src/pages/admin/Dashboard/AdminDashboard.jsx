import "./AdminDashboard.scss";
import { Users, GraduationCap, BookOpen, IndianRupee, AlertCircle, Clock } from "lucide-react";
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
      { label: "Active Learners", value: dashboard?.activeLearners || 0, icon: Users },
      { label: "Active Instructors", value: dashboard?.activeInstructors || 0, icon: GraduationCap },
      { label: "Active Courses", value: activeCourses, icon: BookOpen },
      {
        label: "Platform Revenue",
        value: `INR ${Number(dashboard?.platformRevenue || 0).toLocaleString()}`,
        icon: IndianRupee,
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
    return <p style={{ padding: 40 }}>Access denied. This page is available only for admin accounts.</p>;
  }

  if (loading) {
    return <p style={{ padding: 40 }}>Loading admin analytics...</p>;
  }

  return (
    <div className="admin-dasboard-layout">
      <div className="admin-dashboard">
        {error && <p className="admin-error">{error}</p>}

        <div className="status-grid">
          {stats.map((s) => (
            <div key={s.label} className="stat-card">
              <s.icon size={22} />
              <div>
                <p className="stat-value">{s.value}</p>
                <p className="stat-label">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pending-box">
          <h3>
            <AlertCircle size={18} /> Pending Tasks
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
            <h3>User Growth (Registration / Login)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={dashboard?.userGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line dataKey="registrations" stroke="#2563eb" strokeWidth={2} />
                <Line dataKey="logins" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Revenue Trend (Gross / Commission)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dashboard?.revenueTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="grossRevenue" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="commissionRevenue" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Courses by Category</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                  onClick={handleCategorySelect}
                  cursor="pointer"
                />
              </BarChart>
            </ResponsiveContainer>
            <p className="selected-category-label">
              {selectedCategory ? `Selected Category: ${selectedCategory}` : "Click a category bar to view its label"}
            </p>
          </div>
        </div>

        <div className="activity-box">
          <h3>Recent Activity</h3>
          {!dashboard?.recentActivity?.length ? (
            <p>No activity yet</p>
          ) : (
            <ul>
              {dashboard.recentActivity.map((activity, idx) => (
                <li key={`${activity.type}-${idx}`}>
                  <Clock size={14} />
                  {prettifyActivityMessage(activity.message)}
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

