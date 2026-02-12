import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { courses } from "../../../data/courses";
import "./Assesment.scss";

function Assessment() {
  const navigate = useNavigate();
  const [selectedResultCourse, setSelectedResultCourse] = useState(null);

  const {
    assessmentCourses,
    totalAssessments,
    completed,
    pending,
    avgScore,
  } = useMemo(() => {
    const enrolledCourses =
      JSON.parse(localStorage.getItem("enrolledCourses")) || [];
    const testResults = JSON.parse(localStorage.getItem("testResults")) || [];
    const allQuizzes = JSON.parse(localStorage.getItem("courseQuizzes")) || {};
    const assessmentCourses = enrolledCourses
      .map((ec) => {
        const course = courses.find((c) => c.id === ec.courseId);
        if (!course) return null;
        const quiz = allQuizzes[course.id];
        if (!quiz) return null;
        const result = testResults.find((r) => r.courseId === course.id);
        return {
          id: course.id,
          courseName: course.courseName,
          quiz,
          result,
          status: result ? "Completed" : "Pending",
        };
      })
      .filter(Boolean);
    const totalAssessments = assessmentCourses.length;
    const completed = assessmentCourses.filter(
      (c) => c.status === "Completed",
    ).length;
    const pending = assessmentCourses.filter(
      (c) => c.status === "Pending",
    ).length;
    const avgScore =
      testResults.length === 0
        ? 0
        : Math.floor(
            testResults.reduce((sum, r) => sum + (r.score / r.total) * 100, 0) /
              testResults.length,
          );
    return {
      assessmentCourses,
      totalAssessments,
      completed,
      pending,
      avgScore,
      testResults,
    };
  }, []);
  const selectedResultData = useMemo(() => {
    if (!selectedResultCourse) return null;
    const testResults = JSON.parse(localStorage.getItem("testResults")) || [];
    const allQuizzes = JSON.parse(localStorage.getItem("courseQuizzes")) || [];
    const course = courses.find((c) => c.id === selectedResultCourse);
    const result = testResults.find((r) => r.courseId === selectedResultCourse);
    const quiz = allQuizzes[selectedResultCourse];
    if (!result || !course || !quiz) return null;
    const percentage = Math.floor((result.score / result.total) * 100);
    return {
      courseName: course.courseName,
      score: result.score,
      total: result.total,
      percentage,
      passed: result.passed,
      passingScore: quiz.passingScore,
    };
  }, [selectedResultCourse]);

  return (
    <div className="assessment-container">
      <div className="assessment-status">
        <div className="status-card">
          <h3>{totalAssessments}</h3>
          <p>Total Assessments</p>
        </div>
        <div className="status-card">
          <h3>{completed}</h3>
          <p>Completed</p>
        </div>
        <div className="status-card">
          <h3>{pending}</h3>
          <p>Pending</p>
        </div>
        <div className="status-card">
          <h3>{avgScore}%</h3>
          <p>Average Score</p>
        </div>
      </div>

      <div className="assessment-layout">
        <div className="assessment-left">
          <h3>Available Assessments</h3>

          {assessmentCourses.map((course) => (
            <div key={course.id} className="assessment-card">
              <div className="assessment-card-left">
                <h4>{course.courseName}</h4>
                <span className={`badge ${course.status.toLowerCase()}`}>
                  {course.status}
                </span>
                <div className="assessment-meta">
                  ⏱ {course.quiz.timeLimit} mins|{" "}
                  {course.quiz.questions.length} questions
                </div>
              </div>

              <div className="assessment-card-right">
                {course.status === "Pending" && (
                  <button
                    className="primary-btn"
                    onClick={() =>
                      navigate(`/student-layout/test/${course.id}`)
                    }
                  >
                    Start Test
                  </button>
                )}

                {course.status === "Completed" && (
                  <button
                    className="secondary-btn"
                    onClick={() => setSelectedResultCourse(course.id)}
                  >
                    View Result
                  </button>
                )}
              </div>
            </div>
          ))}
          {assessmentCourses.length === 0 && <p>No assessments available.</p>}
        </div>

        <div className="assessment-right">
          <div className="assessment-rules">
            <h4>Assessment Rules</h4>
            <ul>
              <li>Time limited</li>
              <li>No tab switching</li>
              <li>Passing score: 60%</li>
            </ul>
          </div>

          {selectedResultData && (
            <div className="result-summary">
              <h4>Result Summary</h4>
              <p className="result-course">{selectedResultData.courseName}</p>

              <h2>{selectedResultData.percentage}%</h2>
              <p>Score</p>

              <span
                className={`result-status ${
                  selectedResultData.passed ? "passed" : "failed"
                }`}
              >
                {selectedResultData.passed ? "Passed" : "Failed"}
              </span>

              <div className="result-breakdown">
                <span>
                  Correct: {selectedResultData.score}/{selectedResultData.total}
                </span>
                <span>
                  Wrong: {selectedResultData.total - selectedResultData.score}/
                  {selectedResultData.total}
                </span>
              </div>
              <p className="passing-info">
                Passing Score:{selectedResultData.passingScore}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Assessment;
