import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPublishedCourses } from "../../../services/courseApi";
import { getEnrollmentsByCourses } from "../../../services/enrollmentApi";
import "./Assesment.scss";

function Assessment() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(window.appStore.getItem("currentUser") || "null");
  const userId = currentUser?.id || currentUser?.userId || "";
  const userEmail = String(currentUser?.email || "").trim().toLowerCase();

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

  useEffect(() => {
    if (!userId || courses.length === 0) return;

    const backendEnrollments = enrollments.filter(
      (entry) =>
        String(entry.userId) === String(userId) &&
        String(entry.status || "").toUpperCase() === "ACTIVE"
    );
    const activeEnrollments = backendEnrollments.map((item) => ({ courseId: String(item.courseId) }));

    if (activeEnrollments.length === 0) return;

    const quizStore = JSON.parse(window.appStore.getItem("courseQuizzes") || "{}");
    let modified = false;

    const ensureQuizForCourse = (course) => {
      const key = String(course.id);
      if (quizStore[key]) return;

      const isSpringBootCourse = String(course.courseName || "")
        .trim()
        .toLowerCase() === "spring boot apis 2";

      quizStore[key] = {
        quizTitle: `${course.courseName} - Module Assessment`,
        timeLimit: 20,
        passingScore: 60,
        questions: isSpringBootCourse
          ? [
              {
                question: "What does @RestController combine in Spring Boot?",
                options: [
                  { text: "@Controller + @ResponseBody", isCorrect: true },
                  { text: "@Service + @Component", isCorrect: false },
                  { text: "@Entity + @Repository", isCorrect: false },
                  { text: "@Bean + @Configuration", isCorrect: false },
                ],
              },
              {
                question: "Which HTTP method is typically used to create a resource?",
                options: [
                  { text: "GET", isCorrect: false },
                  { text: "POST", isCorrect: true },
                  { text: "DELETE", isCorrect: false },
                  { text: "PATCH", isCorrect: false },
                ],
              },
            ]
          : [
              {
                question: `What is a key concept covered in ${course.courseName}?`,
                options: [
                  { text: "Core fundamentals and practical usage", isCorrect: true },
                  { text: "Irrelevant external topic", isCorrect: false },
                  { text: "Only historical background", isCorrect: false },
                  { text: "None of the above", isCorrect: false },
                ],
              },
            ],
      };
      modified = true;
    };

    activeEnrollments.forEach((entry) => {
      const course = courses.find((item) => String(item.id) === String(entry.courseId));
      if (course) ensureQuizForCourse(course);
    });

    if (userEmail === "717823s129@kce.ac.in") {
      const springBootCourse = courses.find(
        (course) => String(course.courseName || "").trim().toLowerCase() === "spring boot apis 2"
      );
      if (springBootCourse) ensureQuizForCourse(springBootCourse);
    }

    if (modified) {
      window.appStore.setItem("courseQuizzes", JSON.stringify(quizStore));
    }
  }, [courses, enrollments, userEmail, userId]);

  const { assessmentCourses, totalAssessments, completed, pending, avgScore } = useMemo(() => {
    const testResults = JSON.parse(window.appStore.getItem("testResults") || "[]");
    const allQuizzes = JSON.parse(window.appStore.getItem("courseQuizzes") || "{}");
    const backendEnrollments = enrollments.filter(
      (entry) =>
        String(entry.userId) === String(userId) &&
        String(entry.status || "").toUpperCase() === "ACTIVE"
    );
    const myEnrollments = backendEnrollments;

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

    return {
      assessmentCourses,
      totalAssessments: assessmentCourses.length,
      completed,
      pending,
      avgScore,
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
