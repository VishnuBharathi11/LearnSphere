import { useEffect, useMemo, useState } from "react";
import { Users, BookOpen, Clock, DollarSign, FileText, CheckCircle, XCircle } from "lucide-react";
import "./Approvecourses.scss";
import { getAdminCourses, publishCourse, rejectCourse } from "../../../services/courseApi";
import { getFriendlyErrorMessage } from "../../../services/apiError";

function ApproveCourses() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");

  const loadCourses = async () => {
    try {
      const list = await getAdminCourses();
      setCourses(Array.isArray(list) ? list : []);
      setError("");
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError, "Failed to load courses for approval"));
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const pendingCourses = useMemo(
    () => courses.filter((course) => String(course.status || "").toUpperCase() === "REVIEW"),
    [courses]
  );

  const stats = useMemo(() => {
    const approved = courses.filter((course) => String(course.status || "").toUpperCase() === "PUBLISHED").length;
    return [
      { label: "Pending Review", value: pendingCourses.length, icon: Clock, type: "pending" },
      { label: "Approved", value: approved, icon: CheckCircle, type: "approved" },
    ];
  }, [courses, pendingCourses.length]);

  const approve = async (id) => {
    try {
      await publishCourse(id);
      await loadCourses();
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError, "Failed to approve course"));
    }
  };

  const reject = async (id) => {
    try {
      await rejectCourse(id, "REJECTED_BY_ADMIN");
      await loadCourses();
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError, "Failed to reject course"));
    }
  };

  return (
    <div className="approve-courses-layout">
      <div className="approve-course-content">
        {error && <p className="admin-error">{error}</p>}

        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className={`stat-card ${stat.type}`}>
              <stat.icon size={22} />
              <div>
                <p>{stat.label}</p>
                <h3>{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="course-list">
          {pendingCourses.length === 0 ? (
            <p className="empty">No courses pending review</p>
          ) : (
            pendingCourses.map((course) => (
              <div key={course.id} className="admin-course-card">
                <div className="course-main">
                  <div className="thumb">
                    {course.thumbnail ? <img src={course.thumbnail} alt="thumb" /> : course.courseName?.[0]}
                  </div>
                  <div className="details">
                    <h3>{course.courseName}</h3>
                    <div className="meta">
                      <span>
                        <Users size={14} /> Instructor: {course.instructor || course.instructorId || "-"}
                      </span>
                      <span>
                        <BookOpen size={14} /> Category: {course.category || "-"}
                      </span>
                      <span>
                        <Clock size={14} /> Submitted:{" "}
                        {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : "-"}
                      </span>
                    </div>
                    <p className="description">{course.description || "No description provided."}</p>
                    <div className="extra">
                      <span>
                        <DollarSign size={14} /> Price: <b>INR {course.price || 0}</b>
                      </span>
                      <span>
                        <FileText size={14} /> Lessons: <b>{course.lessons || 0}</b>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="actions">
                  <button className="approve" onClick={() => approve(course.id)}>
                    <CheckCircle size={16} /> Approve
                  </button>

                  <button className="reject" onClick={() => reject(course.id)}>
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ApproveCourses;

