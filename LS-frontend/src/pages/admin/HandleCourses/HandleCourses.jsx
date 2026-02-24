import { useMemo, useState } from "react";
import { Search, Star, Eye, Edit, Trash2 } from "lucide-react";
import "./HandleCourses.scss";
import { useNavigate } from "react-router-dom";

function HandleCourses() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { courses, enrollments, ratings } = useMemo(() => {
    return {
      courses: JSON.parse(window.appStore.getItem("courses")) || [],
      enrollments: JSON.parse(window.appStore.getItem("enrolledCourses")) || [],
      ratings: JSON.parse(window.appStore.getItem("courseRatings")) || [],
    };
  }, []);

  const enrichedCourses = useMemo(() => {
    return courses.map((course) => {
      const courseEnrollments = enrollments.filter(
        (e) => e.courseId === course.id,
      );
      const courseRatings = ratings.filter((r) => r.courseId === course.id);
      const avgRating =
        courseRatings.length === 0
          ? null
          : (
              courseRatings.reduce((s, r) => s + r.rating, 0) /
              courseRatings.length
            ).toFixed(1);
      return {
        ...course,
        learners: courseEnrollments.length,
        revenue: courseEnrollments.length * (course.price || 0),
        rating: avgRating,
      };
    });
  }, [courses, enrollments, ratings]);
  const filteredCourses = enrichedCourses.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    return c.courseName.toLowerCase().includes(search.toLowerCase());
  });

  const summary = useMemo(() => {
    const totalCourses = enrichedCourses.length;
    const published = enrichedCourses.filter(
      (c) => c.status === "published",
    ).length;
    const suspended = enrichedCourses.filter(
      (c) => c.status === "suspended",
    ).length;
    const totalRevenue = enrichedCourses.reduce((sum, c) => sum + c.revenue, 0);
    return { totalCourses, published, suspended, totalRevenue };
  }, [enrichedCourses]);

  const updatedCourseStatus = (id, newStatus) => {
    const allCourses = JSON.parse(window.appStore.getItem("courses")) || [];
    const updated = allCourses.map((c) =>
      c.id === id ? { ...c, status: newStatus } : c,
    );
    window.appStore.setItem("courses", JSON.stringify(updated));
    window.location.reload();
  };

  const deleteCourse = (id) => {
    if (!window.confirm("Delete this course permanently?")) return;
    const updatedCourses = courses.filter((c) => c.id !== id);
    window.appStore.setItem("courses", JSON.stringify(updatedCourses));
    const cleanArray = (key) => {
      const arr = JSON.parse(window.appStore.getItem(key)) || [];
      const filtered = arr.filter((i) => i.courseId !== id);
      window.appStore.setItem(key, JSON.stringify(filtered));
    };
    const cleanMap = (key) => {
      const map = JSON.parse(window.appStore.getItem(key)) || {};
      delete map[id];
      window.appStore.setItem(key, JSON.stringify(map));
    };
    cleanArray("enrolledCourses");
    cleanArray("testResults");
    cleanArray("courseRatings");
    cleanMap("courseLessons");
    cleanMap("courseQuizzes");
    window.location.reload();
  };
  return (
    <div className="handle-courses-layout">
      <div className="manage-courses">
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
            <p>Total Revenue</p>
            <h3>{summary.totalRevenue.toLocaleString()}</h3>
          </div>
        </div>
        <div className="filters">
          <div className="search-box">
            <Search size={16} />
            <input
              placeholder="Search by Courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
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
                <th>Learner</th>
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
                  <tr key={course.id}>
                    <td>
                      <div className="course-title">
                        <strong>{course.courseName}</strong>
                        <span>
                          {" "}
                          {new Date(course.createdAt).toDateString()}
                        </span>
                      </div>
                    </td>
                    <td>{course.instructorName}</td>
                    <td>{course.category}</td>
                    <td>{course.learners}</td>
                    <td className="revenue">
                      ₹{course.revenue.toLocaleString()}
                    </td>
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
                      <Eye
                        size={16}
                        onClick={() => navigate(`/course/${course.id}`)}
                      />
                      <Edit
                        size={16}
                        onClick={() =>
                          navigate(`/admin/edit-course/${course.id}`)
                        }
                      />
                      {course.status !== "suspended" ? (
                        <button
                          onClick={() =>
                            updatedCourseStatus(course.id, "suspended")
                          }
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            updatedCourseStatus(course.id, "published")
                          }
                        >
                          Publish
                        </button>
                      )}
                      <Trash2
                        size={16}
                        onClick={() => deleteCourse(course.id)}
                      />
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
