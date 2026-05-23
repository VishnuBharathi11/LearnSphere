import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trash2, CheckCircle } from "lucide-react";
import "./CreateQuiz.scss";
import { getCourseById, getCourseLessons } from "../../../../services/courseApi";
import { getCourseQuizzesByCourseId, saveCourseQuiz } from "../../../../services/progressApi";
import { getCurrentUser } from "../../../../services/userProfileStore.js";

function CreateQuiz() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const currentUser = getCurrentUser();
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
  const [assessmentType, setAssessmentType] = useState("FINAL");
  const [lessonId, setLessonId] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessons, setLessons] = useState([]);
  const [existingQuizzes, setExistingQuizzes] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });

  const emptyQuestion = () => ({
    question: "",
    points: 10,
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  });

  const optionIsCorrect = (option) => Boolean(option?.isCorrect ?? option?.correct);

  const normalizeQuestions = (questionList) => {
    if (!Array.isArray(questionList)) return [];
    return questionList.map((question, index) => ({
      id: question?.id || `${Date.now()}-${index}`,
      question: question?.question || "",
      points: Number(question?.points || 1),
      options: Array.isArray(question?.options)
        ? question.options.map((option) => ({
            text: option?.text || "",
            isCorrect: optionIsCorrect(option),
          }))
        : [],
    }));
  };

  const applyQuizForm = (quizData) => {
    setQuizTitle(quizData?.quizTitle || "");
    setDescription(quizData?.description || "");
    setPassingScore(quizData?.passingScore || 70);
    setTimeLimit(quizData?.timeLimit || 30);
    setQuestions(normalizeQuestions(quizData?.questions));
  };

  useEffect(() => {
    let active = true;
    async function loadCourseAndQuiz() {
      try {
        const fetched = await getCourseById(String(courseId));
        if (!active) return;

        const ownerMatches =
          String(fetched?.instructorId || "") === String(currentUser?.id || "") ||
          String(fetched?.instructorId || "") === String(currentUser?.email || "");

        if (!ownerMatches) {
          setCourse(null);
          return;
        }

        setCourse(fetched);

        try {
          const list = await getCourseLessons(String(courseId));
          setLessons(Array.isArray(list) ? list : []);
        } catch {
          setLessons([]);
        }

        const loadedQuizzes = await getCourseQuizzesByCourseId(String(courseId));
        if (!active) return;
        setExistingQuizzes(Array.isArray(loadedQuizzes) ? loadedQuizzes : []);
      } catch {
        if (!active) return;
        setCourse(null);
      } finally {
        if (active) setLoadingCourse(false);
      }
    }
    loadCourseAndQuiz();
    return () => {
      active = false;
    };
  }, [courseId, currentUser?.email, currentUser?.id]);

  useEffect(() => {
    const scopedQuiz =
      assessmentType === "LESSON"
        ? existingQuizzes.find(
            (quiz) =>
              String(quiz.assessmentType || "").toUpperCase() === "LESSON" &&
              String(quiz.lessonId || "") === String(lessonId || "")
          )
        : existingQuizzes.find((quiz) => String(quiz.assessmentType || "FINAL").toUpperCase() === "FINAL");

    if (scopedQuiz) {
      applyQuizForm(scopedQuiz);
      if (assessmentType === "LESSON") {
        setLessonTitle(scopedQuiz.lessonTitle || "");
      }
      return;
    }

    applyQuizForm(null);
    if (assessmentType === "FINAL") {
      setLessonTitle("");
    }
  }, [assessmentType, lessonId, existingQuizzes]);

  if (loadingCourse) {
    return null;
  }

  if (currentRole !== "instructor" || !course) {
    return (
      <p style={{ padding: 40 }}>
        Access denied. You can create quizzes only for your own instructor courses.
      </p>
    );
  }

  const setCorrectOption = (index) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options.map((o, i) => ({
        ...o,
        isCorrect: i === index,
      })),
    }));
  };

  const addQuestion = () => {
    setMessage({ type: "", text: "" });
    if (!currentQuestion.question.trim()) {
      setMessage({ type: "error", text: "Enter question text." });
      return;
    }
    if (currentQuestion.options.some((o) => !o.text.trim())) {
      setMessage({ type: "error", text: "All options must be filled." });
      return;
    }
    const correctCount = currentQuestion.options.filter((o) => optionIsCorrect(o)).length;
    if (correctCount !== 1) {
      setMessage({ type: "error", text: "Exactly one correct answer must be selected." });
      return;
    }

    setQuestions((prev) => [...prev, { id: String(Date.now()), ...currentQuestion }]);
    setCurrentQuestion(emptyQuestion());
  };

  const saveQuiz = async () => {
    setMessage({ type: "", text: "" });

    if (!quizTitle.trim()) {
      setMessage({ type: "error", text: "Quiz title is required." });
      return;
    }

    if (questions.length === 0) {
      setMessage({ type: "error", text: "Add at least one question." });
      return;
    }
    if (assessmentType === "LESSON" && !lessonId) {
      setMessage({ type: "error", text: "Select lesson for lesson assessment." });
      return;
    }

    try {
      await saveCourseQuiz({
        courseId: String(courseId),
        instructorId: String(currentUser?.id || currentUser?.email || ""),
        quizTitle,
        description,
        assessmentType,
        lessonId: assessmentType === "LESSON" ? lessonId : null,
        lessonTitle: assessmentType === "LESSON" ? lessonTitle : null,
        passingScore: Number(passingScore),
        timeLimit: Number(timeLimit),
        questions,
      });

      setMessage({ type: "success", text: "Quiz saved to database successfully." });
      setTimeout(() => navigate("/instructor-layout/manage-courses"), 700);
    } catch {
      setMessage({ type: "error", text: "Failed to save quiz in database." });
    }
  };

  return (
    <div className="create-quiz-layout">
      <div className="quiz-page">
        <h2>{course.courseName} - Create Quiz</h2>
        {message.text && <p className={`quiz-message ${message.type}`}>{message.text}</p>}

        <div className="quiz-card">
          <label>Quiz Title</label>
          <input value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} />

          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

          <label>Assessment Type</label>
          <div className="select-field">
            <select
              value={assessmentType}
              onChange={(e) => {
                const next = String(e.target.value || "FINAL");
                setAssessmentType(next);
                if (next === "FINAL") {
                  setLessonId("");
                  setLessonTitle("");
                }
              }}
            >
              <option value="FINAL">Final Course Assessment</option>
              <option value="LESSON">Lesson Assessment</option>
            </select>
          </div>

          {assessmentType === "LESSON" ? (
            <>
              <label>Lesson Name</label>
              <div className="select-field">
                <select
                  value={lessonId}
                  onChange={(e) => {
                    const nextLessonId = String(e.target.value || "");
                    const lesson = lessons.find((item) => String(item.id) === nextLessonId);
                    setLessonId(nextLessonId);
                    setLessonTitle(lesson?.title || "");
                  }}
                >
                  <option value="">Select lesson</option>
                  {lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : null}

          <div className="quiz-grid">
            <div>
              <label>Passing %</label>
              <input type="number" value={passingScore} onChange={(e) => setPassingScore(e.target.value)} />
            </div>
            <div>
              <label>Time (min)</label>
              <input type="number" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="quiz-card">
          <h3>Add Question</h3>
          <textarea
            placeholder="Question"
            value={currentQuestion.question}
            onChange={(e) =>
              setCurrentQuestion((prev) => ({
                ...prev,
                question: e.target.value,
              }))
            }
          />
          {currentQuestion.options.map((opt, i) => (
            <div key={i} className="option-row">
              <input type="radio" name="correct" checked={opt.isCorrect} onChange={() => setCorrectOption(i)} />
              <input
                type="text"
                value={opt.text}
                onChange={(e) => {
                  const updated = [...currentQuestion.options];
                  updated[i].text = e.target.value;
                  setCurrentQuestion((prev) => ({ ...prev, options: updated }));
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
                <strong>{q.question}</strong>
                {q.options.map((o, j) => (
                  <div key={j} className={optionIsCorrect(o) ? "correct" : ""}>
                    {optionIsCorrect(o) && <CheckCircle size={14} />} {o.text}
                  </div>
                ))}
                <button onClick={() => setQuestions((prev) => prev.filter((item) => item.id !== q.id))}>
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

