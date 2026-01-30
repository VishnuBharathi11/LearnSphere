import React from "react";
import { useNavigate } from "react-router-dom";
import "./Assesment.css";

function Assesment() {
  const navigate = useNavigate();
  const availableAssessment = [
    {
      name: "Java Script Fundamentals Quiz",
      category: "Modern JavaScript Development",
      questions: 20,
      duration: "30 mins",
      status: "Pending",
    },
    {
      name: "Java Script Fundamentals Quiz",
      category: "Modern JavaScript Development",
      questions: 20,
      duration: "30 mins",
      status: "Completed",
    },
    {
      name: "Java Script Fundamentals Quiz",
      category: "Modern JavaScript Development",
      questions: 20,
      duration: "30 mins",
      status: "Failed",
    },
  ];

  return (
      <div className="assessment-content">
        <p className="page-subtitle">
          Test your knowledge and track your performance
        </p>

        <div className="assessment-summary">
          <div className="summary-card">
            <span>Total Assessments</span>
            <h3>3</h3>
          </div>

          <div className="summary-card">
            <span>Completed</span>
            <h3>5</h3>
          </div>

          <div className="summary-card">
            <span>Pending</span>
            <h3>52</h3>
          </div>

          <div className="summary-card">
            <span>Average Score</span>
            <h3>83%</h3>
          </div>
        </div>

        <div className="assessment-grid">
          <div>
            <div className="ass-section-title">Available Assessments</div>

            {availableAssessment.map((item, index) => (
              <div className="assessment-card "  key={index}>
                <div className="assessment-info">
                  <h4>{item.name}</h4>
                  <p>{item.category}</p>
                  <span>
                    ⏱ {item.duration} | {item.questions} questions
                  </span>
                </div>

                <div className="assessment-actions">
                  <span
                    className={`status ${
                      item.status === "Pending"
                        ? "pending"
                        : item.status === "Completed"
                        ? "completed"
                        : "failed"
                    }`}
                  >
                    {item.status}
                  </span>

                  {item.status === "Pending" && (
                    <button className="primary-btn" onClick={() => navigate("/take-test")}>Start Test</button>
                  )}

                  {item.status === "Completed" && (
                    <button className="outline-btn" onClick={() => navigate("")}>View Result</button>
                  )}

                  {item.status === "Failed" && (
                    <button className="outline-btn" onClick={() => navigate("/take-test")}>Retake Test</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT SIDE */}
          <div className="right-panel">
            <div className="rules-card">
              <h4>Assessment Rules</h4>
              <ul>
                <li>Time limited</li>
                <li>No tab switching</li>
                <li>Passing score: 60%</li>
              </ul>
            </div>

            <div className="result-card">
              <h4>Result Summary</h4>

              <h1>83%</h1>
              <p>Score</p>

              <span className="pass-badge">Passed</span>

              <div className="score-box">
                <span>Correct: 17/20</span>
                <span>Wrong: 3/20</span>
              </div>

              <div className="result-actions">
                <button className="outline-btn">Review Answers</button>
                <button className="primary-btn" onClick={() => navigate("/take-test")}>Retake Quiz</button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default Assesment;
