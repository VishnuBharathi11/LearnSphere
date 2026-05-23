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
import { getCurrentUser } from "../../../services/userProfileStore.js";

function Managecourse() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [submittingId, setSubmittingId] = useState(null);

  let currentUser = null;
  try {
    currentUser = getCurrentUser();
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
    return null;
  }

  const statusTabs = [
    { label: "All Courses", value: "all" },
    { label: "Published", value: "published" },
    { label: "In Review", value: "review" },
    { label: "Drafts", value: "draft" }
  ];

  return (
    <div className="manage-course-layout">
      <div className="manage-courses-page">
        {/* Sleek Welcome Header */}
        <div className="page-header">
          <button
            className="create-btn"
            onClick={() => navigate("/instructor-layout/create-course")}
          >
            <Plus size={16} />
            Create Course
          </button>
        </div>

        {/* Interactive Filter Toolbar with modern search and glassmorphic tabs */}
        <div className="manage-course-meta">
          <div className="filter-card">
            <div className="filter-search">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-tabs">
              {statusTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  className={`filter-tab-pill ${filterStatus === tab.value ? "active" : ""}`}
                  onClick={() => setFilterStatus(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Courses Cards Listing */}
        {filteredCourses.length === 0 ? (
          <div className="empty-box">
            <div className="empty-icon-wrapper">
              <FileText size={32} />
            </div>
            <h3>No courses found</h3>
            <p>Try refining your search queries or status filters, or start fresh by building a new course.</p>
          </div>
        ) : (
          <div className="course-registry-grid">
            {filteredCourses.map((course) => (
              <div className="manage-course-card" key={course.id}>
                <div className="course-info">
                  <div className="course-top">
                    <div className="course-header-text">
                      <span className="course-category-badge">{course.category || "General"}</span>
                      <h3>{course.courseName}</h3>
                    </div>

                    <span className={`status ${(course.status || "").toLowerCase()}`}>
                      {course.status}
                    </span>
                  </div>

                  <div className="course-actions">
                    <button
                      type="button"
                      className="action-pill-btn"
                      onClick={() =>
                        navigate(`/instructor-layout/manage-courses/${course.id}/lessons`)
                      }
                    >
                      <Upload size={14} /> Lessons
                    </button>

                    <button
                      type="button"
                      className="action-pill-btn"
                      onClick={() =>
                        navigate(`/instructor-layout/manage-courses/${course.id}/quiz`)
                      }
                    >
                      <FileText size={14} />
                      Quiz
                    </button>

                    <button
                      type="button"
                      className="action-pill-btn"
                      onClick={() =>
                        navigate(`/instructor-layout/manage-courses/${course.id}/students`)
                      }
                    >
                      <Users size={14} /> Students
                    </button>

                    <button
                      type="button"
                      className="action-pill-btn"
                      onClick={() =>
                        navigate(`/instructor-layout/manage-courses/${course.id}/analytics`)
                      }
                    >
                      <BarChart3 size={14} /> Analytics
                    </button>

                    {String(course.status || "").toUpperCase() === "DRAFT" && (
                      <button
                        type="button"
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
                    type="button"
                    className="edit-course-btn"
                    onClick={() => navigate(`/instructor-layout/edit-course/${course.id}`)}
                  >
                    <Edit size={14} /> Edit Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Managecourse;

