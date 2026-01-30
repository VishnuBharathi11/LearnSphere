import { useState } from "react";
import {
  Search,
  Star,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import "./HandleCourses.css";
import SidebarAdmin from "../../../components/SideBar-A/SidebarAdmin";

function HandleCourses(){
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const courses = [
    {
      id: 1,
      title: "Modern Frontend Development with React",
      date: "2024-12-15",
      instructor: "Arun Prakash",
      category: "Web Development",
      students: 241,
      revenue: "₹24,000",
      rating: 4.8,
      status: "published"
    },
    {
      id: 2,
      title: "Python for Data Science",
      date: "2024-12-15",
      instructor: "Arun Prakash",
      category: "Data Science",
      students: 241,
      revenue: "₹24,000",
      rating: 4.8,
      status: "published"
    },
    {
      id: 3,
      title: "Mobile App Development",
      date: "2024-12-15",
      instructor: "Arun Prakash",
      category: "Mobile Development",
      students: 0,
      revenue: "₹0",
      rating: null,
      status: "suspended"
    }
  ];

  const filteredCourses = courses.filter(c => {
    if (status !== "all" && c.status !== status) return false;
    return c.title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="handle-courses-layout">
        <SidebarAdmin/>
        <div className="manage-courses">
      <h2 className="page-title">Manage Courses</h2>
      <p className="page-subtitle">Oversee all courses in the platform</p>
      <div className="stats">
        <div className="stat-card">
          <p>Total Courses</p>
          <h3>3</h3>
        </div>
        <div className="stat-card">
          <p>Published</p>
          <h3>2</h3>
        </div>
        <div className="stat-card">
          <p>Suspended</p>
          <h3>1</h3>
        </div>
        <div className="stat-card">
          <p>Total Revenue</p>
          <h3>₹2.1L</h3>
        </div>
      </div>
      <div className="filters">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Search by Courses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Courses</th>
              <th>Instructor</th>
              <th>Category</th>
              <th>Students</th>
              <th>Revenue</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map(course => (
              <tr key={course.id}>
                <td>
                  <div className="course-title">
                    <strong>{course.title}</strong>
                    <span>{course.date}</span>
                  </div>
                </td>
                <td>{course.instructor}</td>
                <td>{course.category}</td>
                <td>{course.students}</td>
                <td className="revenue">{course.revenue}</td>
                <td>
                  {course.rating ? (
                    <span className="rating">
                      <Star size={14} /> {course.rating}
                    </span>
                  ) : (
                    <span className="na">N/A</span>
                  )}
                </td>
                <td>
                  <span className={`status ${course.status}`}>
                    {course.status}
                  </span>
                </td>
                <td className="actions">
                  <Eye size={16} />
                  <Edit size={16} />
                  <Trash2 size={16} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

export default HandleCourses;
