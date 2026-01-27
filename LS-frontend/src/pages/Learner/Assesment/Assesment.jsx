import React from "react";
import SidebarStudent from "../../../components/SideBar-S/SidebarStudent"
import "./Assesment.css";

function Assesment() {
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
    <div className="assessment-layout">
      <SidebarStudent />

      <div className="assessment-content">
        <h2 className="page-title">Assessments</h2>
        <p className="page-subtitle">
          Test your knowledge and track your performance
        </p>

        {/* ===== SUMMARY ===== */}
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

        {/* ===== MAIN GRID ===== */}
        <div className="assessment-grid">
          {/* LEFT SIDE */}
          <div>
            <h3 className="section-title">Available Assessments</h3>

            {availableAssessment.map((item, index) => (
              <div className="assessment-card" key={index}>
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
                    <button className="primary-btn">Start Test</button>
                  )}

                  {item.status === "Completed" && (
                    <button className="outline-btn">View Result</button>
                  )}

                  {item.status === "Failed" && (
                    <button className="outline-btn">Retake Test</button>
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
                <button className="primary-btn">Retake Quiz</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Assesment;
