import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import { getCourseQuizzesByCourseId, saveFinalAssessmentDb, saveLessonAssessmentDb } from "../../../services/progressApi";
import { getCurrentUser } from "../../../services/userProfileStore.js";
import "./TestTaking.scss";

function TestTaking() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();

  const currentUser = getCurrentUser();
  const userId = currentUser?.id || currentUser?.userId;
  const mode = searchParams.get("mode") === "lesson" ? "lesson" : "final";
  const lessonId = searchParams.get("lessonId") || "";

  const [quiz, setQuiz] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reviewFlags, setReviewFlags] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const optionIsCorrect = (option) => Boolean(option?.isCorrect ?? option?.correct);

  useEffect(() => {
    if (!userId) {
      navigate("/login", { replace: true });
    }
  }, [navigate, userId]);

  useEffect(() => {
    let active = true;
    async function loadQuiz() {
      setLoadingQuiz(true);
      try {
        const list = await getCourseQuizzesByCourseId(courseId);
        if (!active) return;
        const quizzes = Array.isArray(list) ? list : [];
        const selected =
          mode === "lesson"
            ? quizzes.find(
                (item) =>
                  String(item.assessmentType || "").toUpperCase() === "LESSON" &&
                  String(item.lessonId || "") === String(lessonId || "")
              )
            : quizzes.find((item) => String(item.assessmentType || "FINAL").toUpperCase() === "FINAL");
        setQuiz(selected || null);
      } catch {
        if (!active) return;
        setQuiz(null);
      } finally {
        if (active) setLoadingQuiz(false);
      }
    }
    loadQuiz();
    return () => {
      active = false;
    };
  }, [courseId, lessonId, mode]);

  const questions = useMemo(() => {
    if (!Array.isArray(quiz?.questions)) return [];
    return quiz.questions;
  }, [quiz]);

  useEffect(() => {
    if (!quiz) return;
    const minutes = Number(quiz.timeLimit || 20);
    setSecondsLeft(Math.max(0, minutes * 60));
  }, [quiz]);

  const finishAssessment = () => {
    if (!quiz || questions.length === 0) return;
    let score = 0;
    questions.forEach((q, index) => {
      const correctIndex = q.options.findIndex((o) => optionIsCorrect(o));
      if (answers[index] === correctIndex) score += 1;
    });

    const total = questions.length;
    const passingScore = Number(quiz.passingScore || 60);
    const passed = score >= Math.ceil((passingScore / 100) * total);

    const resultPayload = {
      score,
      total,
      passed,
      passingScore,
    };

    if (mode === "lesson" && lessonId) {
      saveLessonAssessmentDb(userId, courseId, lessonId, resultPayload).catch(() => null);
    } else {
      saveFinalAssessmentDb(userId, courseId, resultPayload).catch(() => null);
    }

    navigate("/student-layout/result", {
      state: {
        courseId: Number(courseId),
        correct: score,
        total,
        passed,
        mode,
        lessonId,
      },
      replace: true,
    });
  };

  useEffect(() => {
    if (!quiz || secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          finishAssessment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [quiz, secondsLeft]);

  const progressPercent = questions.length ? Math.round(((current + 1) / questions.length) * 100) : 0;
  const minutesView = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secondsView = String(secondsLeft % 60).padStart(2, "0");
  const currentQuestion = questions[current];
  const selectedOption = answers[current];

  if (!userId) return null;

  if (loadingQuiz) {
    return <div className="test-loading">Loading assessment...</div>;
  }

  if (!quiz || !questions.length) {
    return (
      <div className="test-empty">
        <h2>No quiz available for this assessment.</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="assessment-attempt-page">
      <div className="assessment-attempt-card">
        <div className="attempt-topbar">
          <div className="attempt-title">
            <h3>{quiz.quizTitle || "Course Assessment"}</h3>
            <span>{mode === "lesson" ? "Lesson Assessment" : "Final Assessment"}</span>
          </div>

          <div className="attempt-progress-wrap">
            <span>
              {current + 1}/{questions.length}
            </span>
            <div className="attempt-progress-track">
              <div className="attempt-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <button
            className={`review-btn ${reviewFlags[current] ? "active" : ""}`}
            onClick={() => setReviewFlags((prev) => ({ ...prev, [current]: !prev[current] }))}
          >
            {reviewFlags[current] ? "Marked for review" : "Mark as review"}
          </button>

          <div className="attempt-timer">
            <Clock3 size={16} />
            <span>{minutesView}.{secondsView} Min</span>
          </div>
        </div>

        <div className="attempt-question-shell">
          <p className="question-index">Question {current + 1}</p>
          <h4>{currentQuestion.question}</h4>

          <div className="attempt-options">
            {currentQuestion.options.map((option, optionIndex) => (
              <button
                key={optionIndex}
                className={`attempt-option ${selectedOption === optionIndex ? "selected" : ""}`}
                onClick={() => setAnswers((prev) => ({ ...prev, [current]: optionIndex }))}
              >
                <span>{option.text}</span>
                <span className="radio-dot" />
              </button>
            ))}
          </div>
        </div>

        <div className="attempt-actions">
          <button className="nav-btn" disabled={current === 0} onClick={() => setCurrent((prev) => prev - 1)}>
            <ArrowLeft size={16} />
            Previous
          </button>

          {current < questions.length - 1 ? (
            <button className="nav-btn next" onClick={() => setCurrent((prev) => prev + 1)}>
              Next
              <ArrowRight size={16} />
            </button>
          ) : (
            <button className="finish-btn" onClick={finishAssessment}>
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TestTaking;
