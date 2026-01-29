import React, { useState } from "react";
import {
  Search,
  Plus,
  Upload,
  FileText,
  BarChart3,
  Users,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Sidebar,
} from "lucide-react";
import "./Managecourse.css";
import SidebarInstructor from "../../../components/SideBar-I/SidebarInstructor";
import { useNavigate } from "react-router-dom";

function Managecourse() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const courses = [
    {
      id: 1,
      title: "Modern Frontend Development with React",
      category: "Web Development",
      students: 189,
      lessons: 42,
      revenue: 154500,
      rating: 4.8,
      status: "published",
      thumbnail: "🎨",
    },
    {
      id: 2,
      title: "Complete AI & Deep Learning",
      category: "Artificial Intelligence",
      students: 112,
      lessons: 36,
      revenue: 98500,
      rating: 4.6,
      status: "draft",
      thumbnail: "🤖",
    },
  ];
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || course.status === filterStatus;
    return matchesSearch && matchesStatus;
  });
  const togglePublish = (id) => {
    console.log("Toggle publish:", id);
  };
  const editCourse = (id) => {
    console.log("Edit course:", id);
  };
  const deleteCourse = (id) => {
    console.log("Delete course:", id);
  };
  const navigate=useNavigate();
  return (
    <div className="manage-course-layout">
      <SidebarInstructor />
      <div className="manage-courses-page">
        <div className="page-header">
          <div>
            <h1>Manage Courses</h1>
            <p>Manage and organize your courses</p>
          </div>
          <button className="logout-btn">Logout</button>
        </div>
        <div className="manage-course-meta">
          <button className="create-btn">
            <Plus size={16} />
            Create Course
          </button>
          <div className="filter-card">
            <div className="filter-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filter-select">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Courses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>
        {filteredCourses.length === 0 ? (
          <div className="empty-box">No courses found</div>
        ) : (
          filteredCourses.map((course) => (
            <div className="manage-course-card" key={course.id}>
              <div className="course-thumb">{course.thumbnail}</div>

              <div className="course-info">
                <div className="course-top">
                  <div>
                    <h3>{course.title}</h3>
                    <p>{course.category}</p>
                  </div>
                  <span className={`status ${course.status}`}>
                    {course.status}
                  </span>
                </div>
                <div className="course-stats">
                  <div>
                    <span>Students</span>
                    <strong>{course.students}</strong>
                  </div>
                  <div>
                    <span>Lessons</span>
                    <strong>{course.lessons}</strong>
                  </div>
                  <div>
                    <span>Revenue</span>
                    <strong>₹{course.revenue.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span>Rating</span>
                    <strong>{course.rating} ⭐</strong>
                  </div>
                </div>
                <div className="course-actions">
                  <button onClick={()=>navigate(`/instructor/manage-courses/${course.id}`)}>
                    <Upload size={14} /> Upload Lesson
                  </button>
                  <button>
                    <FileText size={14} /> Create Quiz
                  </button>
                  <button>
                    <Users size={14} /> Students
                  </button>
                  <button>
                    <BarChart3 size={14} /> Analytics
                  </button>
                </div>
              </div>
              <div className="manage-actions">
                <button onClick={() => togglePublish(course.id)}>
                  {course.status === "published" ? (
                    <EyeOff size={14} />
                  ) : (
                    <Eye size={14} />
                  )}
                  {course.status === "published" ? "Unpublish" : "Publish"}
                </button>
                <button onClick={() => editCourse(course.id)}>
                  <Edit size={14} /> Edit
                </button>
                <button
                  onClick={() => deleteCourse(course.id)}
                  className="danger"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Managecourse;
