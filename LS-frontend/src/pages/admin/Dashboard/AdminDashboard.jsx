import "./AdminDashboard.scss";
import {
  Users,
  GraduationCap,
  BookOpen,
  IndianRupee,
  AlertCircle,
  Clock
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
  ResponsiveContainer
} from "recharts";
import SidebarAdmin from "../../../components/SideBar-A/SidebarAdmin";
function AdminDashboard(){
  const stats = [
    { label: "Total Students", value: 2470, icon: Users },
    { label: "Total Instructors", value: 132, icon: GraduationCap },
    { label: "Active Courses", value: 132, icon: BookOpen },
    { label: "Total Revenue", value: "₹32.4L", icon: IndianRupee }
  ];
  const userGrowth = [
    { month: "Jan", students: 320, instructors: 25 },
    { month: "Feb", students: 480, instructors: 35 },
    { month: "Mar", students: 620, instructors: 42 },
    { month: "Apr", students: 890, instructors: 58 },
    { month: "May", students: 1240, instructors: 78 },
    { month: "Jun", students: 1680, instructors: 95 },
    { month: "Jul", students: 2100, instructors: 118 },
    { month: "Aug", students: 2470, instructors: 132 }
  ];
  const revenueTrend = [
    { month: "Jan", revenue: 2.5 },
    { month: "Feb", revenue: 3.8 },
    { month: "Mar", revenue: 4.2 },
    { month: "Apr", revenue: 6.5 },
    { month: "May", revenue: 8.9 },
    { month: "Jun", revenue: 12.4 },
    { month: "Jul", revenue: 18.7 },
    { month: "Aug", revenue: 25.3 },
    { month: "Sep", revenue: 32.4 }
  ];
  const categories = [
    { name: "Development", value: 35, color: "#2563eb" },
    { name: "Business", value: 25, color: "#7c3aed" },
    { name: "Design", value: 20, color: "#10b981" },
    { name: "Marketing", value: 12, color: "#f59e0b" },
    { name: "Others", value: 8, color: "#6b7280" }
  ];
  const tasks = [
    { text: "Review 8 pending course approvals", priority: "high" },
    { text: "Process 12 instructor applications", priority: "high" },
    { text: "Resolve 3 flagged discussions", priority: "medium" },
    { text: "Review 5 user reports", priority: "medium" }
  ];
  return (
    <div className="admin-dasboard-layout">
        <SidebarAdmin/>
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
          <AlertCircle size={18} /> Pending Tasks Requiring Attention
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
          <h3>User Growth Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={userGrowth}>
              <XAxis dataKey="month" />
              <YAxis />
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
              <Tooltip cursor={false} />
              <Bar dataKey="revenue" fill="#f59e0b" activeBar={false} />
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
        <h3>Recent System Activity</h3>
        <ul>
          <li><Clock size={14}/> New course submitted for approval</li>
          <li><Clock size={14}/> User reported inappropriate content</li>
          <li><Clock size={14}/> System backup completed</li>
        </ul>
      </div>
    </div>
    </div>
  );
};

export default AdminDashboard;
