import { useEffect, useMemo, useState } from "react";
import { Search, Ban, UserCheck, Trash2 } from "lucide-react";
import "./HandleCourses.scss";
import { useNavigate } from "react-router-dom";
import {
  activateCourse,
  adminDeleteCourse,
  archiveCourse,
  getAdminCourses,
} from "../../../services/courseApi";
import { getCourseMetrics } from "../../../services/adminApi";
import { getFriendlyErrorMessage } from "../../../services/apiError";

function HandleCourses() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [courses, setCourses] = useState([]);
  const [courseMetrics, setCourseMetrics] = useState([]);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const courseList = await getAdminCourses();
      const ids = courseList.map((course) => String(course.id));
      const metrics = await getCourseMetrics(ids);
      setCourses(courseList);
      setCourseMetrics(metrics);
      setError("");
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError, "Failed to load courses"));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const metricsMap = useMemo(
    () =>
      new Map(
        (courseMetrics || []).map((metric) => [String(metric.courseId), metric])
      ),
    [courseMetrics]
  );

  const enrichedCourses = useMemo(
    () =>
      courses.map((course) => {
        const metric = metricsMap.get(String(course.id)) || {};
        return {
          ...course,
          learners: Number(metric.learners || 0),
          revenue: Number(metric.platformRevenue || 0),
        };
      }),
    [courses, metricsMap]
  );

  const filteredCourses = useMemo(
    () =>
      enrichedCourses.filter((course) => {
        const matchesStatus =
          statusFilter === "ALL" ? true : String(course.status || "").toUpperCase() === statusFilter;
        const term = search.toLowerCase();
        const matchesSearch =
          String(course.courseName || "").toLowerCase().includes(term) ||
          String(course.instructor || "").toLowerCase().includes(term);
        return matchesStatus && matchesSearch;
      }),
    [enrichedCourses, statusFilter, search]
  );

  const summary = useMemo(() => {
    const totalCourses = enrichedCourses.length;
    const published = enrichedCourses.filter(
      (course) => String(course.status || "").toUpperCase() === "PUBLISHED"
    ).length;
    const suspended = enrichedCourses.filter(
      (course) => String(course.status || "").toUpperCase() === "ARCHIVED"
    ).length;
    const totalRevenue = enrichedCourses.reduce((sum, course) => sum + Number(course.revenue || 0), 0);
    return { totalCourses, published, suspended, totalRevenue };
  }, [enrichedCourses]);

  const updateCourseStatus = async (id, action) => {
    try {
      if (action === "suspend") {
        await archiveCourse(id);
      } else {
        await activateCourse(id);
      }
      await loadData();
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError, "Failed to update course status"));
    }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm("Delete this course permanently?")) return;
    try {
      await adminDeleteCourse(id);
      await loadData();
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError, "Failed to delete course"));
    }
  };

  return (
    <div className="handle-courses-layout">
      <div className="manage-courses">
        {error && <p className="admin-error">{error}</p>}

        <div className="summ-status">
          <div className="summ-status-card">
            <p>Total Courses</p>
            <h3>{summary.totalCourses}</h3>
          </div>
          <div className="summ-status-card">
            <p>Published</p>
            <h3>{summary.published}</h3>
          </div>
          <div className="summ-status-card">
            <p>Suspended</p>
            <h3>{summary.suspended}</h3>
          </div>
          <div className="summ-status-card">
            <p>Platform Revenue</p>
            <h3>{summary.totalRevenue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="filters">
          <div className="search-box">
            <Search size={16} />
            <input
              placeholder="Search courses or instructors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="REVIEW">Review</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Instructor</th>
                <th>Category</th>
                <th>Learners</th>
                <th>Revenue</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty">
                    No courses found
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr
                    key={course.id}
                    className="row-clickable"
                    onClick={() => navigate(`/student-layout/learn/${course.id}?adminPreview=true`)}
                  >
                    <td>
                      <div className="course-title">
                        <strong>{course.courseName}</strong>
                        <span>{course.createdAt ? new Date(course.createdAt).toDateString() : "-"}</span>
                      </div>
                    </td>
                    <td>{course.instructor || course.instructorId || "-"}</td>
                    <td>{course.category || "-"}</td>
                    <td>{course.learners}</td>
                    <td className="revenue">INR {course.revenue.toLocaleString()}</td>
                    <td>{course.rating || "N/A"}</td>
                    <td>
                      <span className={`status ${String(course.status || "").toLowerCase()}`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="actions">
                      {String(course.status || "").toUpperCase() === "ARCHIVED" ? (
                        <button
                          type="button"
                          className="icon-action activate"
                          title="Activate course"
                          onClick={(event) => {
                            event.stopPropagation();
                            updateCourseStatus(course.id, "activate");
                          }}
                        >
                          <UserCheck size={16} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="icon-action suspend"
                          title="Suspend course"
                          onClick={(event) => {
                            event.stopPropagation();
                            updateCourseStatus(course.id, "suspend");
                          }}
                        >
                          <Ban size={16} />
                        </button>
                      )}
                      <button
                        type="button"
                        className="icon-action delete"
                        title="Delete course"
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteCourse(course.id);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default HandleCourses;
