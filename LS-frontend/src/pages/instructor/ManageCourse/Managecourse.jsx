import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Upload,
  FileText,
  BarChart3,
  Users,
  Edit,
} from "lucide-react";
import "./Managecourse.scss";
import { useNavigate } from "react-router-dom";
import { getInstructorCourses, submitCourseForReview } from "../../../services/courseApi";

function Managecourse() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [submittingId, setSubmittingId] = useState(null);

  let currentUser = null;
  try {
    currentUser = JSON.parse(window.appStore.getItem("currentUser"));
  } catch {
    currentUser = null;
  }

  useEffect(() => {
    const role = String(currentUser?.role || "").toLowerCase();
    if (!currentUser || role !== "instructor") {
      navigate("/login", { replace: true });
      return;
    }

    async function loadCourses() {
      try {
        const response = await getInstructorCourses(String(currentUser.id), 0, 200);
        setCourses(response || []);
      } catch {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, [currentUser, navigate]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const name = (course.courseName || "").toLowerCase();
      const category = (course.category || "").toLowerCase();
      const q = searchQuery.toLowerCase();
      const matchesSearch = name.includes(q) || category.includes(q);
      const normalizedStatus = (course.status || "").toLowerCase();
      const matchesStatus = filterStatus === "all" || normalizedStatus === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [courses, searchQuery, filterStatus]);

  const onSubmitForReview = async (courseId) => {
    setSubmittingId(courseId);
    try {
      const updated = await submitCourseForReview(courseId);
      setCourses((prev) =>
        prev.map((course) =>
          String(course.id) === String(courseId)
            ? { ...course, status: updated?.status || "REVIEW" }
            : course
        )
      );
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return <p style={{ padding: 40 }}>Loading courses...</p>;
  }

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
                <option value="review">In Review</option>
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

                  <span className={`status ${(course.status || "").toLowerCase()}`}>
                    {course.status}
                  </span>
                </div>

                <div className="course-actions">
                  <button
                    onClick={() =>
                      navigate(`/instructor-layout/manage-courses/${course.id}/lessons`)
                    }
                  >
                    <Upload size={14} /> Lessons
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/instructor-layout/manage-courses/${course.id}/quiz`)
                    }
                  >
                    <FileText size={14} />
                    Quiz
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/instructor-layout/manage-courses/${course.id}/students`)
                    }
                  >
                    <Users size={14} /> Students
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/instructor-layout/manage-courses/${course.id}/analytics`)
                    }
                  >
                    <BarChart3 size={14} /> Analytics
                  </button>

                  {String(course.status || "").toUpperCase() === "DRAFT" && (
                    <button
                      className="submit-review"
                      disabled={submittingId === course.id}
                      onClick={() => onSubmitForReview(course.id)}
                    >
                      {submittingId === course.id ? "Submitting..." : "Submit Review"}
                    </button>
                  )}
                </div>
              </div>

              <div className="manage-actions">
                <button
                  onClick={() => navigate(`/instructor-layout/edit-course/${course.id}`)}
                >
                  <Edit size={14} /> Edit
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
