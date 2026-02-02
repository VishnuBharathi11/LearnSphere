import "./AdminDashboard.scss";
import {
  Users,
  GraduationCap,
  BookOpen,
  IndianRupee,
  AlertCircle,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useMemo } from "react";
import SidebarAdmin from "../../../components/SideBar-A/SidebarAdmin";
const COLORS = ["#2563eb", "#7c3aed", "#10b981", "#f59e0b", "#6b7280"];
function AdminDashboard() {
  const { users, courses, enrollments } = useMemo(
    () => ({
      users: JSON.parse(localStorage.getItem("users")) || [],
      courses: JSON.parse(localStorage.getItem("courses")) || [],
      enrollments: JSON.parse(localStorage.getItem("enrolledCourses")) || [],
    }),
    [],
  );
  const totalStudents = users.filter((u) => u.role === "student").length;
  const totalInstructors = users.filter((u) => u.role === "instructor").length;
  const activeCourses = courses.filter((c) => c.status === "published").length;

  const totalRevenue = enrollments.reduce((sum, e) => {
    const course = courses.find((c) => c.id === e.courseId);
    return sum + (course?.price || 0);
  }, 0);
  const stats = [
    { label: "Total Students", value: totalStudents, icon: Users },
    {
      label: "Total Instructors",
      value: totalInstructors,
      icon: GraduationCap,
    },
    { label: "Active Courses", value: activeCourses, icon: BookOpen },
    {
      label: "Total Revenue",
      value: `₹${(totalRevenue / 100000).toFixed(1)}L`,
      icon: IndianRupee,
    },
  ];
  const userGrowth = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      if (!u.createdAt) return;
      const month = new Date(u.createdAt).toLocaleString("default", {
        month: "short",
      });
      if (!map[month]) map[month] = { month, students: 0, instructors: 0 };
      if (u.role === "student") map[month].students++;
      if (u.role === "instructor") map[month].instructors++;
    });
    return Object.values(map);
  }, [users]);
  const revenueTrend = useMemo(() => {
    const map = {};
    enrollments.forEach((e) => {
      const course = courses.find((c) => c.id === e.courseId);
      if (!course || !course.price || !e.enrolledAt) return;

      const month = new Date(e.enrolledAt).toLocaleString("default", {
        month: "short",
      });
      map[month] = (map[month] || 0) + course.price;
    });
    return Object.entries(map).map(([month, revenue]) => ({
      month,
      revenue,
    }));
  }, [enrollments, courses]);
  const categories = useMemo(() => {
    const map = {};
    courses.forEach((c) => {
      if (!c.category) return;
      map[c.category] = (map[c.category] || 0) + 1;
    });
    return Object.entries(map).map(([name, value], i) => ({
      name,
      value,
      color: COLORS[i % COLORS.length],
    }));
  }, [courses]);
  const tasks = [
    {
      text: `${courses.filter((c) => c.status === "pending").length} courses pending approval`,
      priority: "high",
    },
    { text: "Instructor applications to review", priority: "medium" },
    { text: "Flagged discussions reported", priority: "medium" },
  ];
  return (
    <div className="admin-dasboard-layout">
      <SidebarAdmin />
      <div className="admin-dashboard">
        <h2 className="page-title">System Overview</h2>
        <p className="page-subtitle">Welcome back, Admin User!</p>
        <div className="status-grid">
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
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
            {tasks.map((t, i) => (
              <div key={i} className={`task ${t.priority}`}>
                <span>{t.text}</span>
                <span className="badge">{t.priority}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="charts-grid">
          <div className="chart-card">
            <h3>User Growth</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={userGrowth}>
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line dataKey="students" stroke="#2563eb" />
                <Line dataKey="instructors" stroke="#7c3aed" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenueTrend}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Courses by Category</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categories} dataKey="value" nameKey="name">
                  {categories.map((c, i) => (
                    <Cell key={i} fill={c.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="activity-box">
          <h3>Recent Activity</h3>
          <ul>
            <li>
              <Clock size={14} /> New course submitted
            </li>
            <li>
              <Clock size={14} /> Discussion flagged
            </li>
            <li>
              <Clock size={14} /> Backup completed
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
