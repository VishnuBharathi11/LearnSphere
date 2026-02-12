import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trash2, CheckCircle } from "lucide-react";
import "./CreateQuiz.scss";
import SidebarInstructor from "../../../../components/SideBar-I/SidebarInstructor";

function CreateQuiz() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [quizTitle, setQuizTitle] = useState("");
  const [description, setDescription] = useState("");
  const [passingScore, setPassingScore] = useState(70);
  const [timeLimit, setTimeLimit] = useState(30);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    points: 10,
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  });
  const [questions, setQuestions] = useState([]);
  const setCorrectOption = (index) => {
    setCurrentQuestion({
      ...currentQuestion,
      options: currentQuestion.options.map((o, i) => ({
        ...o,
        isCorrect: i === index,
      })),
    });
  };
  const addQuestion = () => {
    if (!currentQuestion.question) return;
    setQuestions([
      ...questions,
      {
        id: questions.length + 1,
        ...currentQuestion,
      },
    ]);
    setCurrentQuestion({
      question: "",
      points: 10,
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
    });
  };
  const saveQuiz = () => {
    if (!quizTitle || questions.length === 0) return;
    const allQuizzes = JSON.parse(localStorage.getItem("courseQuizzes")) || {};
    const quizData = {
      courseId,
      quizTitle,
      description,
      passingScore: Number(passingScore),
      timeLimit: Number(timeLimit),
      questions,
      createdAt: new Date().toISOString(),
    };
    allQuizzes[courseId] = quizData;
    localStorage.setItem("courseQuizzes", JSON.stringify(allQuizzes));
    navigate("/manage-courses");
  };

  return (
    <div className="create-quiz-layout">
      <div className="quiz-page">
        <h1>Create Quiz</h1>
        <p className="course-ref">Course ID: {courseId}</p>
        <div className="quiz-card">
          <label>Quiz Title</label>
          <input
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
          />
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="quiz-grid">
            <div>
              <label>Passing %</label>
              <input
                type="number"
                value={passingScore}
                onChange={(e) => setPassingScore(e.target.value)}
              />
            </div>
            <div>
              <label>Time (min)</label>
              <input
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="quiz-card">
          <h3>Add Question</h3>
          <textarea
            placeholder="Question"
            value={currentQuestion.question}
            onChange={(e) =>
              setCurrentQuestion({
                ...currentQuestion,
                question: e.target.value,
              })
            }
          />
          {currentQuestion.options.map((opt, i) => (
            <div key={i} className="option-row">
              <input
                type="checkbox"
                checked={opt.isCorrect}
                onChange={() => setCorrectOption(i)}
              />
              <input
                value={opt.text}
                onChange={(e) => {
                  const opts = [...currentQuestion.options];
                  opts[i].text = e.target.value;
                  setCurrentQuestion({ ...currentQuestion, options: opts });
                }}
                placeholder={`Option ${i + 1}`}
              />
            </div>
          ))}
          <button onClick={addQuestion}>
            <Plus size={16} /> Add Question
          </button>
        </div>
        {questions.length > 0 && (
          <div className="quiz-card">
            <h3>Questions</h3>
            {questions.map((q, i) => (
              <div key={i} className="question-preview">
                <strong>
                  {i + 1}. {q.question}
                </strong>
                {q.options.map((o, j) => (
                  <div key={j} className={o.isCorrect ? "correct" : ""}>
                    {o.isCorrect && <CheckCircle size={14} />} {o.text}
                  </div>
                ))}
                <button
                  onClick={() =>
                    setQuestions(questions.filter((_, idx) => idx !== i))
                  }
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="quiz-actions">
          <button className="save" onClick={saveQuiz}>
            Save Quiz
          </button>
          <button className="cancel" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateQuiz;
