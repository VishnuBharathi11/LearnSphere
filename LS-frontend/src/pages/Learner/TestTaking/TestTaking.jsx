import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  saveFinalAssessmentResult,
  saveLessonAssessmentResult,
} from "../../../services/learnerProgressStore";
import { getCourseQuizzesByCourseId } from "../../../services/progressApi";
import { getCurrentUser } from "../../../services/userProfileStore.js";

function TestTaking() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();

  const currentUser = getCurrentUser();
  const userId = currentUser?.id || currentUser?.userId;
  const mode = searchParams.get("mode") === "lesson" ? "lesson" : "final";
  const lessonId = searchParams.get("lessonId") || "";
  const lessonIndex = Number(searchParams.get("lessonIndex") || 0);

  const [quiz, setQuiz] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(true);

  const questions = useMemo(() => {
    if (!quiz?.questions || !Array.isArray(quiz.questions)) return [];
    if (mode === "lesson") {
      if (quiz.questions.length === 0) return [];
      return [quiz.questions[Math.abs(lessonIndex) % quiz.questions.length]];
    }
    return quiz.questions;
  }, [lessonIndex, mode, quiz]);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});

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
  }, [courseId]);

  if (!userId) {
    navigate("/login");
    return null;
  }

  if (loadingQuiz) {
    return (
      <div className="test-container">
        <h2>Loading quiz...</h2>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="test-container">
        <h2>No quiz available for this assessment.</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const handleOptionClick = (index) => {
    setAnswers({ ...answers, [current]: index });
  };

  const handleSubmit = () => {
    let score = 0;
    questions.forEach((q, index) => {
      const correctIndex = q.options.findIndex((o) => o.isCorrect);
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
      saveLessonAssessmentResult(userId, courseId, lessonId, resultPayload);
    } else {
      saveFinalAssessmentResult(userId, courseId, resultPayload);
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
    });
  };

  return (
    <div className="test-container">
      <div className="test-header">
        <h2>{mode === "lesson" ? "Lesson Assessment" : quiz.quizTitle}</h2>
        <span>
          Question {current + 1}/{questions.length}
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
        <button disabled={current === 0} onClick={() => setCurrent(current - 1)}>
          Previous
        </button>
        {current < questions.length - 1 ? (
          <button className="primary" onClick={() => setCurrent(current + 1)}>
            Next
          </button>
        ) : (
          <button className="submit" onClick={handleSubmit}>
            Submit
          </button>
        )}
      </div>
    </div>
  );
}

export default TestTaking;

