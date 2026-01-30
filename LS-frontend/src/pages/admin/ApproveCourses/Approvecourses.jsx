import { useNavigate } from "react-router-dom";
import {
  Users,
  BookOpen,
  Clock,
  DollarSign,
  FileText,
  Eye,
  CheckCircle,
  XCircle
} from "lucide-react";
import "./Approvecourses.scss";

function ApproveCourses(){
  const navigate = useNavigate();

  const stats = [
    { label: "Pending Review", value: 8, icon: Clock, type: "pending" },
    { label: "Approved Today", value: 3, icon: CheckCircle, type: "approved" },
    { label: "Rejected Today", value: 1, icon: XCircle, type: "rejected" }
  ];

  const courses = [
    {
      id: 1,
      title: "Advanced React Patterns",
      instructor: "Arun Prakash",
      category: "Web Development",
      submitted: "2024-06-01",
      description:
        "Master advanced React patterns including render props, HOCs, compound components, and more.",
      price: "₹1299",
      lessons: 35,
      thumbnail: "AR"
    },
    {
      id: 2,
      title: "Machine Learning Fundamentals",
      instructor: "Dr. Kishore Menon",
      category: "Machine Learning",
      submitted: "2024-06-02",
      description:
        "Comprehensive introduction to machine learning algorithms and practical implementations.",
      price: "₹1599",
      lessons: 42,
      thumbnail: "ML"
    },
    {
      id: 3,
      title: "iOS Development with SwiftUI",
      instructor: "Priya Patel",
      category: "Mobile Development",
      submitted: "2024-06-03",
      description:
        "Build modern iOS apps using SwiftUI and the latest Apple technologies.",
      price: "₹1499",
      lessons: 38,
      thumbnail: "iOS"
    }
  ];

  return (
    <div className="approve-courses">
      <h2 className="page-title">Approve / Reject Courses</h2>
      <p className="page-subtitle">Review and approve course submissions</p>

      {/* Stats */}
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

      {/* Course List */}
      <div className="course-list">
        {courses.map(course => (
          <div key={course.id} className="course-card">
            <div className="course-main">
              <div className="thumb">{course.thumbnail}</div>

              <div className="details">
                <h3>{course.title}</h3>

                <div className="meta">
                  <span><Users size={14} /> Instructor: {course.instructor}</span>
                  <span><BookOpen size={14} /> Category: {course.category}</span>
                  <span><Clock size={14} /> Submitted: {course.submitted}</span>
                </div>

                <p className="description">{course.description}</p>

                <div className="extra">
                  <span>
                    <DollarSign size={14} /> Price: <b>{course.price}</b>
                  </span>
                  <span>
                    <FileText size={14} /> Lessons: <b>{course.lessons}</b>
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="actions">
              <button
                className="review"
                onClick={() =>
                  navigate(`/approve-courses/${course.id}/review`)
                }
              >
                <Eye size={16} /> Review
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApproveCourses;
