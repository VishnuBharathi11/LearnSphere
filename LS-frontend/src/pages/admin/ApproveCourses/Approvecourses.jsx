import { useNavigate } from "react-router-dom";
import {
  Users,
  BookOpen,
  Clock,
  DollarSign,
  FileText,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import "./Approvecourses.scss";
import { useMemo, useState } from "react";

function ApproveCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState(() => {
    return JSON.parse(window.appStore.getItem("courses")) || [];
  });
  const pendingCourses = courses.filter((c) => c.status === "pending");
  const stats = useMemo(() => {
    const today = new Date().toISOString();
    const approvedToday = courses.filter(
      (c) =>
        c.status === "published" &&
        new Date(c.updatedAt).toDateString() === today,
    ).length;
    const rejectedToday = courses.filter(
      (c) =>
        c.status === "published" &&
        new Date(c.updatedAt).toDateString() === today,
    ).length;
    return [
      {
        label: "Pending Review",
        value: pendingCourses.length,
        icon: Clock,
        type: "pending",
      },
      {
        label: "Approved Today",
        value: approvedToday.length,
        icon: Clock,
        type: "approved",
      },
      {
        label: "Rejected Today",
        value: rejectedToday.length,
        icon: Clock,
        type: "rejected",
      },
    ];
  }, [courses, pendingCourses.length]);
  const approveCourse = (id) => {
    const updated = courses.map((c) =>
      c.id === id
        ? { ...c, status: "published", updatedAt: new Date().toISOString() }
        : c,
    );
    window.appStore.setItem("courses", JSON.stringify(updated));
    setCourses(updated);
  };
  const rejectCourse = (id) => {
    const updated = courses.map((c) =>
      c.id === id
        ? { ...c, status: "rejected", updatedAt: new Date().toISOString() }
        : c,
    );
    window.appStore.setItem("courses", JSON.stringify(updated));
    setCourses(updated);
  };

  return (
    <div className="approve-courses-layout">
      <div className="approve-course-content">
        <div className="stats-grid">
          {stats.map((s, i) => (
            <div key={i} className={`stat-card ${s.type}`}>
              <s.icon size={22} />
              <div>
                <p>{s.label}</p>
                <h3>{s.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="course-list">
          {pendingCourses.length === 0 ? (
            <p className="empty">No pending courses</p>
          ) : (
            pendingCourses.map((course) => (
              <div key={course.id} className="admin-course-card">
                <div className="course-main">
                  <div className="thumb">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt="thumb" />
                    ) : (
                      course.courseName?.[0]
                    )}
                  </div>
                  <div className="details">
                    <h3>{course.courseName}</h3>
                    <div className="meta">
                      <span>
                        {" "}
                        <Users size={14} /> Instructor: {course.instructorName}
                      </span>
                      <span>
                        <BookOpen size={14} /> Category: {course.category}
                      </span>
                      <span>
                        <Clock size={14} /> Submitted:{" "}
                        {new Date(course.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="description">
                      {course.description || "No description provided."}
                    </p>
                    <div className="extra">
                      <span>
                        <DollarSign size={14} /> Price: <b>₹{course.price}</b>
                      </span>
                      <span>
                        <FileText size={14} /> Lessons: <b>{course.lessons}</b>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="actions">
                  <button className="review"
                    onClick={() =>
                      navigate(`/approve-courses/${course.id}/review`)
                    }
                  >
                    <Eye size={16} /> Review
                  </button>
                   <button
                    className="approve"
                    onClick={() => approveCourse(course.id)}
                  >
                    <CheckCircle size={16} /> Approve
                  </button>

                  <button
                    className="reject"
                    onClick={() => rejectCourse(course.id)}
                  >
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
