import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./TestTaking.scss";

const questions = [
  {
    question: "What does HTML stand for?",
    correct: 0,
    options: [
      "Hyper Text Markup Language",
      "High Text Machine Language",
      "Hyper Transfer Markup Language",
      "Home Tool Markup Language",
    ],
  },
  {
    question: "Which tag is used for React components?",
    correct: 3,
    options: ["<component>", "<react>", "<div>", "Function / Class"],
  },
  {
    question: "Which hook is used for state?",
    correct: 2,
    options: ["useData", "useFetch", "useState", "useEffect"],
  },
  {
    question: "Which language is used for styling?",
    correct: 2,
    options: ["HTML", "Java", "CSS", "Node"],
  },
  {
    question: "React is developed by?",
    correct: 1,
    options: ["Google", "Facebook", "Microsoft", "Amazon"],
  },
];

function TestTaking() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});

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
      if (answers[index] === q.correct) {
        score++;
      }
    });

    const total = questions.length;
    const passed = score >= Math.ceil(total * 0.6); // 60% pass

    const storedResults =
      JSON.parse(localStorage.getItem("testResults")) || [];

    const updatedResults = [
      ...storedResults.filter(
        (r) => r.courseId !== Number(courseId)
      ),
      {
        courseId: Number(courseId),
        score,
        total,
        passed,
      },
    ];

    localStorage.setItem(
      "testResults",
      JSON.stringify(updatedResults)
    );

    navigate("/student-layout/assessment");
  };

  return (
    <div className="test-container">
      <div className="test-header">
        <h2>JavaScript Fundamentals Test</h2>
        <span>
          Question {current + 1} / {questions.length}
        </span>
      </div>

      <div className="question-box">
        <h3>{questions[current].question}</h3>

        <div className="options">
          {questions[current].options.map((opt, i) => (
            <div
              key={i}
              className={`option ${
                answers[current] === i ? "selected" : ""
              }`}
              onClick={() => handleOptionClick(i)}
            >
              {opt}
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

        {current < questions.length - 1 ? (
          <button className="primary" onClick={handleNext}>
            Next
          </button>
        ) : (
          <button className="submit" onClick={handleSubmit}>
            Submit Test
          </button>
        )}
      </div>
    </div>
  );
}

export default TestTaking;
