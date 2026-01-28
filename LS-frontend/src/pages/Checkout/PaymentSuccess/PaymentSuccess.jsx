import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Award,
  Clock,
  CreditCard,
  Calendar,
  Play,
} from "lucide-react";
import courses from "../../../data/courses";
import "./PaymentSuccess.css";

function PaymentSuccess() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const courseId = state?.courseId;
  const course = courses.find((c) => c.id === courseId);
  useEffect(() => {
    const enrolled = JSON.parse(localStorage.getItem("enrolledCourses")) || [];
    if (!enrolled.includes(course.id)) {
      enrolled.push(course.id);
      localStorage.setItem("enrolledCourses", JSON.stringify(enrolled));
    }
  }, [course.id]);
  return (
    <div className="success-page">
      <div className="success-container">
        <div className="success-header">
          <CheckCircle size={96} className="success-icon" />
          <h1>Payment Successful!</h1>
          <p>You are now enrolled in this course</p>

          <div className="success-sub">
            <Award size={18} />
            <span>Your learning journey begins now</span>
          </div>
        </div>
        <div className="ps-card ps-course-card">
          <div className="course-info">
            <h2>{course.courseName}</h2>
            <p>
              Instructor: <strong>{course.instructor}</strong>
            </p>
            <div className="badge">
              <Clock size={16} />
              Lifetime Access
            </div>
          </div>
        </div>
        <div className="ps-card transaction-card">
          <h3>
            <CreditCard size={18} /> Transaction Details
          </h3>
          <div className="transaction-grid">
            <div>
              <label>Course</label>
              <p>{course.courseName}</p>
            </div>
            <div>
              <label>Date</label>
              <p>
                <Calendar size={14} /> {new Date().toDateString()}
              </p>
            </div>
            <div>
              <label>Amount Paid</label>
              <p className="amount">₹{course.price}</p>
            </div>
          </div>
        </div>
        <div className="actions">
          <button
            className="ps-primary-btn"
            onClick={() => navigate(`/course/${course.id}`)}
          >
            <Play size={20} />
            Start Learning
          </button>
          <button
            className="ps-secondary-btn"
            onClick={() => navigate("/learner-my-courses")}
          >
            Go to My Courses
          </button>
        </div>
        <p className="support">
          Need help? <span>Contact Support</span>
        </p>
      </div>
    </div>
  );
}

export default PaymentSuccess;
