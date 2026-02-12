import React from "react";
import "./ResultPage.scss";
import { useLocation, useNavigate } from "react-router-dom";
function AssessmentResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    total = 0,
    correct = 0,
    passed = false,
    courseId,
  } = location.state || {};
  const percentage = total ? Math.round((correct / total) * 100) : 0;
  const handleRetry = () => {
    navigate(`/student-layout/test/${courseId}`);
  };
  const handleContinue = () => {
    navigate("/student-layout/certificate/learner-my-course");
  };
  const handleCertificate = () => {
    navigate(`/student-layout/certificate/${courseId}`);
  };
  return (
    <div className="result-wrapper">
      <div className="result-card">
        <h2>Assessment Result</h2>
        <div className={`result-status ${passed ? "pass" : "fail"}`}>
          {passed ? "Passed 🎉" : "Failed ❌"}
        </div>
        <div className="score-circle">
          <h1>{percentage}%</h1>
          <p>Score</p>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${percentage}%` }} />
        </div>
        <div className="result-stats">
          <div>
            <h4>{correct}</h4>
            <span>Correct</span>
          </div>
          <div>
            <h4>{total - correct}</h4>
            <span>Wrong</span>
          </div>
          <div>
            <h4>{total}</h4>
            <span>Total</span>
          </div>
        </div>
        <div className="result-actions">
          {!passed && (
            <button className="retry" onClick={handleRetry}>
              Retry Test
            </button>
          )}
          <button className="primary" onClick={handleContinue}>
            Go to My Courses
          </button>
          {passed && (
            <button className="certificate" onClick={handleCertificate}>
              View Certificate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssessmentResult;
