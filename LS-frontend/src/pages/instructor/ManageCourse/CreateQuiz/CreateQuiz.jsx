import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trash2, CheckCircle } from "lucide-react";
import "./CreateQuiz.scss";
import { getCourseById } from "../../../../services/courseApi";

function CreateQuiz() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const currentUser = JSON.parse(window.appStore.getItem("currentUser"));
  const currentRole = String(currentUser?.role || "").toLowerCase();
  const [course, setCourse] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
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
  const quizKey = `${currentUser?.id || "guest"}_${courseId}`;
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    async function loadCourse() {
      try {
        const fetched = await getCourseById(String(courseId));
        if (String(fetched?.instructorId) === String(currentUser?.id)) {
          setCourse(fetched);
        } else {
          setCourse(null);
        }
      } catch {
        setCourse(null);
      } finally {
        setLoadingCourse(false);
      }
    }
    loadCourse();
  }, [courseId, currentUser?.id]);

  useEffect(() => {
    const allQuizzes = JSON.parse(window.appStore.getItem("courseQuizzes") || "{}");
    const existing = allQuizzes[quizKey];
    if (!existing) return;
    setQuizTitle(existing.quizTitle || "");
    setDescription(existing.description || "");
    setPassingScore(existing.passingScore || 70);
    setTimeLimit(existing.timeLimit || 30);
    setQuestions(Array.isArray(existing.questions) ? existing.questions : []);
  }, [quizKey]);

  if (loadingCourse) {
    return <p style={{ padding: 40 }}>Loading course...</p>;
  }

  if (currentRole !== "instructor" || !course) {
    return (
      <p style={{ padding: 40 }}>
        Access denied. You can create quizzes only for your own instructor courses.
      </p>
    );
  }
  
  const setCorrectOption = (index) => {
    setCurrentQuestion((prev)=>({
      ...prev,
      options: prev.options.map((o, i) => ({
        ...o,
        isCorrect: i === index,
      })),
    }));
  };
  const addQuestion = () => {
    setMessage({ type: "", text: "" });
    if (!currentQuestion.question.trim()){ 
      setMessage({ type: "error", text: "Enter question text." });
      return;
    }
    if(currentQuestion.options.some((o)=>!o.text.trim())){
      setMessage({ type: "error", text: "All options must be filled." });
      return;
    }
    const correctCount=currentQuestion.options.filter((o)=>o.isCorrect).length;
    if(correctCount!==1){
      setMessage({ type: "error", text: "Exactly one correct answer must be selected." });
      return;
    }
    setQuestions((prev)=>[
      ...prev,{id:Date.now(),...currentQuestion},
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
    setMessage({ type: "", text: "" });
    if (!quizTitle.trim()) {
      setMessage({ type: "error", text: "Quiz title is required." });
      return
    };
    if(questions.length===0){
      setMessage({ type: "error", text: "Add at least one question." });
      return;
    }
    const allQuizzes = JSON.parse(window.appStore.getItem("courseQuizzes") || "{}");
    const quizData = {
      courseId:Number(courseId),
      instructorId: currentUser.id,
      quizTitle,
      description,
      passingScore: Number(passingScore),
      timeLimit: Number(timeLimit),
      questions,
      createdAt: new Date().toISOString(),
      updatedAt:new Date().toISOString(),
    };
    allQuizzes[quizKey] = quizData;
    window.appStore.setItem("courseQuizzes", JSON.stringify(allQuizzes));
    setMessage({ type: "success", text: "Quiz saved successfully." });
    setTimeout(() => navigate("/instructor-layout/manage-courses"), 500);
  };

  return (
    <div className="create-quiz-layout">
      <div className="quiz-page">
        <h2>{course.courseName}-Create Quiz</h2>
        {message.text && <p className={`quiz-message ${message.type}`}>{message.text}</p>}
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
              setCurrentQuestion((prev)=>({
                ...prev,
                question: e.target.value,
              }))
            }
          />
          {currentQuestion.options.map((opt, i) => (
            <div key={i} className="option-row">
              <input
                type="radio"
                name="correct"
                checked={opt.isCorrect}
                onChange={() => setCorrectOption(i)}
              />
              <input
                value={opt.text}
                onChange={(e) => {
                  const updated = [...currentQuestion.options];
                  updated[i].text = e.target.value;
                  setCurrentQuestion((prev)=>({ ...prev, options: updated }));
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
            {questions.map((q) => (
              <div key={q.id} className="question-preview">
                <strong>
                  {q.question}
                </strong>
                {q.options.map((o, j) => (
                  <div key={j} className={o.isCorrect ? "correct" : ""}>
                    {o.isCorrect && <CheckCircle size={14} />} {o.text}
                  </div>
                ))}
                <button
                  onClick={() =>
                    setQuestions((prev)=>prev.filter((item)=>item.id!==q.id))
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
