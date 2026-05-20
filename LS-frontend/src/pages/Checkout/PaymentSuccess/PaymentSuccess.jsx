import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Play } from "lucide-react";
import { getCourseById } from "../../../services/courseApi";
import { pushLocalNotification } from "../../../services/activityNotificationStore";
import { getCurrentUser } from "../../../services/userProfileStore";
import "./PaymentSuccess.scss";

function PaymentSuccess() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const courseId = state?.courseId;
  const paymentId = state?.paymentId;
  const currentUser = getCurrentUser();
  const userId = currentUser?.id || currentUser?.userId || "";

  const [course, setCourse] = useState(null);

  useEffect(() => {
    if (!courseId) return;
    getCourseById(String(courseId))
      .then((data) => setCourse(data))
      .catch(() => setCourse(null));
  }, [courseId]);

  useEffect(() => {
    if (!courseId || !userId) return;
    pushLocalNotification({
      userId: String(userId),
      role: "learner",
      type: "payment-success",
      eventKey: `learner-payment-success-${courseId}-${paymentId || "na"}`,
      title: "Payment successful",
      message: `Payment completed${paymentId ? ` (ID: ${paymentId})` : ""}. Enrollment is active.`,
      courseId: String(courseId),
      targetPath: `/student-layout/learn/${courseId}`,
    });
  }, [courseId, paymentId, userId]);

  if (!courseId) {
    return (
      <div className="success-page">
        <div className="success-container">
          <h1>Invalid payment session</h1>
          <button className="ps-secondary-btn" onClick={() => navigate("/courses")}>Go to Courses</button>
        </div>
      </div>
    );
  }

  return (
    <div className="success-page">
      <div className="success-container">
        <div className="success-header">
          <CheckCircle size={96} className="success-icon" />
          <h1>Payment Successful!</h1>
          <p>
            {course ? `You are now enrolled in ${course.courseName}` : "Enrollment completed successfully."}
          </p>
        </div>

        <div className="ps-card transaction-card">
          <h3>Transaction Details</h3>
          <div className="transaction-grid">
            <div>
              <label>Course</label>
              <p>{course?.courseName || `Course #${courseId}`}</p>
            </div>
            <div>
              <label>Date</label>
              <p>{new Date().toDateString()}</p>
            </div>
            <div>
              <label>Amount Paid</label>
              <p className="amount">Rs {course?.price ?? "-"}</p>
            </div>
            <div>
              <label>Payment ID</label>
              <p>{paymentId || "-"}</p>
            </div>
          </div>
        </div>

        <div className="actions">
          <button className="ps-primary-btn" onClick={() => navigate(`/student-layout/learn/${courseId}`)}>
            <Play size={18} />
            Start Learning
          </button>
          <button className="ps-secondary-btn" onClick={() => navigate("/student-layout/my-courses")}>
            Go to My Courses
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
