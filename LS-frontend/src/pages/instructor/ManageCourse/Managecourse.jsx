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
} from "lucide-react";
import "./Managecourse.scss";
import { useNavigate } from "react-router-dom";

function Managecourse() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [courses, setCourses] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("courses")) || [];

    return stored.map((c) => ({
      id: c.id,
      courseName: c.courseName || c.title || "Untitled Course",
      category: c.category || "General",
      status: c.status || "draft",
      students: c.students || 0,
      lessons: c.lessons || 0,
      rating: c.rating || 0,
      revenue: c.revenue || 0,
    }));
  });

  const filteredCourses = courses.filter((course) => {
    const name = course.courseName ?? "";
    const category = course.category ?? "";

    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || course.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const togglePublish = (id) => {
    const updated = courses.map((course) =>
      course.id === id
        ? {
            ...course,
            status: course.status === "published" ? "draft" : "published",
          }
        : course
    );

    setCourses(updated);
    localStorage.setItem("courses", JSON.stringify(updated));
  };

  const deleteCourse = (id) => {
    const updated = courses.filter((course) => course.id !== id);
    setCourses(updated);
    localStorage.setItem("courses", JSON.stringify(updated));
  };

  const navigate = useNavigate();

  return (
    <div className="manage-course-layout">
      <div className="manage-courses-page">
        <div className="page-header">
          <button
            className="create-btn"
            onClick={() => navigate("/instructor-layout/create-course")}
          >
            <Plus size={16} />
            Create Course
          </button>
        </div>

        <div className="manage-course-meta">
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
              <div className="course-info">
                <div className="course-top">
                  <div>
                    <h3>{course.courseName}</h3>
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
                    <strong>₹{(course.revenue ?? 0).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span>Rating</span>
                    <strong>{course.rating} ⭐</strong>
                  </div>
                </div>

                <div className="course-actions">
                  <button
                    onClick={() =>
                      navigate(
                        `/instructor-layout/manage-courses/${course.id}/lessons`
                      )
                    }
                  >
                    <Upload size={14} /> Upload Lesson
                  </button>

                  <button
                    onClick={() =>
                      navigate(
                        `/instructor-layout/manage-courses/${course.id}/quiz`
                      )
                    }
                  >
                    <FileText size={14} /> Create Quiz
                  </button>

                  <button
                    onClick={() =>
                      navigate(
                        `/instructor-layout/manage-courses/${course.id}/students`
                      )
                    }
                  >
                    <Users size={14} /> Students
                  </button>

                  <button
                    onClick={() =>
                      navigate(
                        `/instructor-layout/manage-courses/${course.id}/analytics`
                      )
                    }
                  >
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

                <button
                  onClick={() =>
                    navigate(
                      `/instructor-layout/edit-course/${course.id}`
                    )
                  }
                >
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
