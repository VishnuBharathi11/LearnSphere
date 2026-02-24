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
const COLORS = ["#2563eb", "#7c3aed", "#10b981", "#f59e0b", "#6b7280"];
function AdminDashboard() {
  const currentUser = JSON.parse(window.appStore.getItem("currentUser"));
  const { users, courses, enrollments,discussions } = useMemo(
    () => ({
      users: JSON.parse(window.appStore.getItem("users")) || [],
      courses: JSON.parse(window.appStore.getItem("courses")) || [],
      enrollments: JSON.parse(window.appStore.getItem("enrolledCourses")) || [],
      discussions: JSON.parse(window.appStore.getItem("courseDiscussions")) || [],
    }),
    [],
  );
  const totalLearners = users.filter((u) => u.role === "learner").length;
  const totalInstructors = users.filter((u) => u.role === "instructor").length;
  const activeCourses = courses.filter((c) => c.status === "published").length;

  const totalRevenue = enrollments.reduce((sum, e) => {
    const course = courses.find((c) => c.id === e.courseId);
    return sum + (course?.price || 0);
  }, 0);
  const pendingCourses = courses.filter((c) => c.status === "draft").length;
  const flaggedDiscussions = discussions.filter((d) => d.status === "flagged").length;
  const stats = [
    { label: "Total Learners", value: totalLearners, icon: Users },
    {label: "Total Instructors",value: totalInstructors,icon: GraduationCap,},
    { label: "Active Courses", value: activeCourses, icon: BookOpen },
    {label: "Total Revenue",value: `₹${(totalRevenue / 100000).toFixed(1)}L`,icon: IndianRupee,},
  ];

  const userGrowth = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      if (!u.createdAt) return;
      const month = new Date(u.createdAt).toLocaleString("default", {
        month: "short",
      });
      if (!map[month]) 
        map[month] = { month, learners: 0, instructors: 0 };
      if (u.role === "learner") 
        map[month].learners++;
      if (u.role === "instructor") 
        map[month].instructors++;
    });
    return Object.values(map);
  }, [users]);

  const revenueTrend = useMemo(() => {
    const map = {};
    enrollments.forEach((e) => {
      const course = courses.find((c) => c.id === e.courseId);
      if (!course || !course.price || !e.enrolledAt) 
        return;
      const month = new Date(e.enrolledAt).toLocaleString("default", {month: "short",});
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

  const recentActivity=useMemo(()=>{
    const activities=[];
    courses.slice(-3).forEach((c)=>activities.push(`Course "${c.courseName}" created`));
    enrollments.slice(-3).forEach((e)=>activities.push(`New enrollment in course ID ${e.courseId}`));
    discussions.filter((d)=>d.status==="flagged").slice(-2).forEach(()=>activities.push("Discussion flagged learner"));
    return activities.slice(-5).reverse();
  },[courses,enrollments,discussions]);

  const tasks = [
    {text: `${pendingCourses} courses pending approval`,priority: "high",},
    { text: `${flaggedDiscussions} dicussions flagged`, priority: "medium" },
  ];

  if(!currentUser||currentUser.role!=="admin"){
    return <p style={{ padding: 40 }}>Unauthorized access.</p>;
  }
  return (
    <div className="admin-dasboard-layout">
      <div className="admin-dashboard">
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
                <Line dataKey="learners" stroke="#2563eb" />
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
          {recentActivity.length===0?(
            <p>No activity yet</p>
          ):(
            <ul>
              {recentActivity.map((a,i)=>(
                <li key={i}><Clock size={14}/> {a}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
