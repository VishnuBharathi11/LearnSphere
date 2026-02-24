import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPublishedCourses } from "../../../services/courseApi";
import { getEnrollmentsByCourses } from "../../../services/enrollmentApi";
import "./Assesment.scss";

function Assessment() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(window.appStore.getItem("currentUser") || "null");
  const userId = currentUser?.id || currentUser?.userId || "";

  const [selectedResultCourse, setSelectedResultCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    if (!userId) return;

    let active = true;
    async function load() {
      try {
        const published = await getPublishedCourses(0, 300);
        if (!active) return;
        const safeCourses = Array.isArray(published) ? published : [];
        setCourses(safeCourses);

        const ids = safeCourses.map((course) => String(course.id));
        const list = await getEnrollmentsByCourses(ids);
        if (!active) return;
        setEnrollments(Array.isArray(list) ? list : []);
      } catch {
        if (!active) return;
        setCourses([]);
        setEnrollments([]);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [userId]);

  const { assessmentCourses, totalAssessments, completed, pending, avgScore, failed, passed } = useMemo(() => {
    const testResults = JSON.parse(window.appStore.getItem("testResults") || "[]");
    const allQuizzes = JSON.parse(window.appStore.getItem("courseQuizzes") || "{}");

    const myEnrollments = enrollments.filter(
      (entry) =>
        String(entry.userId) === String(userId) &&
        String(entry.status || "").toUpperCase() === "ACTIVE"
    );

    const assessmentCourses = myEnrollments
      .map((entry) => {
        const course = courses.find((item) => String(item.id) === String(entry.courseId));
        if (!course) return null;

        const quiz = allQuizzes[String(course.id)] || allQuizzes[course.id];
        if (!quiz) return null;

        const result = testResults.find(
          (item) =>
            String(item.courseId) === String(course.id) &&
            String(item.studentId) === String(userId)
        );

        const status = result ? "Completed" : "Pending";

        return {
          id: course.id,
          courseName: course.courseName,
          quiz,
          result,
          status,
        };
      })
      .filter(Boolean);

    const completed = assessmentCourses.filter((item) => item.status === "Completed").length;
    const pending = assessmentCourses.filter((item) => item.status === "Pending").length;

    const scored = assessmentCourses.filter((item) => item.result);
    const avgScore =
      scored.length === 0
        ? 0
        : Math.floor(
            scored.reduce((sum, item) => sum + (item.result.score / item.result.total) * 100, 0) /
              scored.length
          );

    const passed = scored.filter((item) => item.result?.passed).length;
    const failed = scored.filter((item) => !item.result?.passed).length;

    return {
      assessmentCourses,
      totalAssessments: assessmentCourses.length,
      completed,
      pending,
      avgScore,
      failed,
      passed,
    };
  }, [courses, enrollments, userId]);

  const selectedResultData = useMemo(() => {
    if (!selectedResultCourse) return null;

    const testResults = JSON.parse(window.appStore.getItem("testResults") || "[]");
    const allQuizzes = JSON.parse(window.appStore.getItem("courseQuizzes") || "{}");

    const course = courses.find((item) => String(item.id) === String(selectedResultCourse));
    const result = testResults.find(
      (item) =>
        String(item.courseId) === String(selectedResultCourse) &&
        String(item.studentId) === String(userId)
    );
    const quiz = allQuizzes[String(selectedResultCourse)] || allQuizzes[selectedResultCourse];

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
  }, [selectedResultCourse, courses, userId]);

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

      <div className="assessment-status assessment-sub-status">
        <div className="status-card">
          <h3>{pending}</h3>
          <p>Not Started</p>
        </div>
        <div className="status-card">
          <h3>{failed}</h3>
          <p>Failed</p>
        </div>
        <div className="status-card">
          <h3>{passed}</h3>
          <p>Passed</p>
        </div>
      </div>

      <div className="assessment-layout">
        <div className="assessment-left">
          <h3>Available Assessments</h3>

          {assessmentCourses.length === 0 ? (
            <p>No assessments available.</p>
          ) : (
            assessmentCourses.map((course) => (
              <div key={course.id} className="assessment-card">
                <div className="assessment-card-left">
                  <h4>{course.courseName}</h4>
                  <span className={`badge ${course.status.toLowerCase()}`}>{course.status}</span>
                  <div className="assessment-meta">
                    {course.quiz.timeLimit} mins | {course.quiz.questions.length} questions
                  </div>
                </div>

                <div className="assessment-card-right">
                  {course.status === "Pending" && (
                    <button className="primary-btn" onClick={() => navigate(`/student-layout/test/${course.id}`)}>
                      Start Test
                    </button>
                  )}

                  {course.status === "Completed" && (
                    <>
                      <button className="secondary-btn" onClick={() => setSelectedResultCourse(course.id)}>
                        View Result
                      </button>
                      {!course.result?.passed && (
                        <button className="primary-btn" onClick={() => navigate(`/student-layout/test/${course.id}`)}>
                          Retake Quiz
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
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

              <span className={`result-status ${selectedResultData.passed ? "passed" : "failed"}`}>
                {selectedResultData.passed ? "Passed" : "Failed"}
              </span>

              <div className="result-breakdown">
                <span>
                  Correct: {selectedResultData.score}/{selectedResultData.total}
                </span>
                <span>
                  Wrong: {selectedResultData.total - selectedResultData.score}/{selectedResultData.total}
                </span>
              </div>
              <p className="passing-info">Passing Score: {selectedResultData.passingScore}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Assessment;
