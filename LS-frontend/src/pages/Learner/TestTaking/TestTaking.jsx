import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function TestTaking() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const currentUser = JSON.parse(window.appStore.getItem("currentUser"));
  const allQuizzes = JSON.parse(window.appStore.getItem("courseQuizzes")) || {};
  const quiz = allQuizzes[courseId];

  const questions = quiz.questions;
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  if (!currentUser) {
    navigate("/login");
    return null;
  }
if (!quiz) {
    return (
      <div className="test-container">
        <h2>No quiz Available for this course.</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }
  const handleOptionClick = (index) => {
    setAnswers({ ...answers, [current]: index });
  };
  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    }
  };
  const handleSubmit = () => {
    let score = 0;
    questions.forEach((q, index) => {
      const correctIndex = q.options.findIndex((o) => o.isCorrect);
      if (answers[index] === correctIndex) {
        score++;
      }
    });
    const total = questions.length;
    const passed = score >= Math.ceil((quiz.passingScore / 100) * total);
    const storedResults = JSON.parse(window.appStore.getItem("testResults")) || [];
    const UpdateResults = [
      ...storedResults.filter((r) => !(r.courseId===Number(courseId)&&r.studentId===currentUser.id)),
      {
        courseId: Number(courseId),
        studentId: currentUser.id,
        score,
        total,
        passed,
        submittedAt: new Date().toISOString(),
      },
    ];
    window.appStore.setItem("testResults", JSON.stringify(UpdateResults));
    navigate("/student-layout/result", {
      state: { courseId: Number(courseId), correct: score, total, passed },
    });
  };
  return (
    <div className="test-container">
      <div className="test-header">
        <h2>{quiz.quizTitle}</h2>
        <span>
          Question{current + 1}/{questions.length}
        </span>
      </div>
      <div className="question-box">
        <h3>{questions[current].question}</h3>
        <div className="options">
          {questions[current].options.map((opt, i) => (
            <div
              key={i}
              className={`option${answers[current] === i ? "selected" : ""}`}
              onClick={() => handleOptionClick(i)}
            >
              {opt.text}
            </div>
          ))}
        </div>
      </div>
      <div className="test-actions">
        <button
          disabled={current === 0}
          onClick={() => setCurrent(current - 1)}
        >
          Previous
        </button>
        {current<questions.length-1?(
          <button className="primary" onClick={handleNext}>Next</button>
        ):(
          <button className="submit" onClick={handleSubmit}>Submit</button>
        )}
      </div>
    </div>
  );
}

export default TestTaking;
