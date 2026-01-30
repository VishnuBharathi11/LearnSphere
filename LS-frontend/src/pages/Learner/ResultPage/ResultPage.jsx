import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ResultPage.scss";

function AssessmentResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    score = 0,
    total = 0,
    correct = 0,
  } = location.state || {};

  const percentage = total
    ? Math.round((correct / total) * 100)
    : 0;

  const passed = percentage >= 60;

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
          <div
            className="progress-fill"
            style={{ width: `${percentage}%` }}
          />
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
          <button
            className="retry"
            onClick={() => navigate("/take-test")}
          >
            Retry Test
          </button>

          <button
            className="primary"
            onClick={() =>
              navigate("/student-layout/learner-my-course")
            }
          >
            Go to My Courses
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssessmentResult;
