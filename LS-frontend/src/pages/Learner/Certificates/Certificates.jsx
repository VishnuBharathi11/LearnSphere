import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { courses } from "../../../data/courses";
import "./Certificates.scss";

function Certificates() {
  const navigate = useNavigate();

  const certificates = useMemo(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) return [];

    const enrolled = JSON.parse(localStorage.getItem("enrolledCourses")) || [];
    const testResults = JSON.parse(localStorage.getItem("testResults")) || [];

    return enrolled
      .map((enrollment) => {
        if (enrollment.studentId !== user.id) return null;

        const course = courses.find((c) => c.id === enrollment.courseId);
        const totalLessons = enrollment.totalLessons || course?.lessons || 0;
        const completedLessons = enrollment.completedLessons || 0;
        if (!course || !totalLessons || completedLessons < totalLessons) {
          return null;
        }

        const result = testResults.find(
          (res) =>
            res.courseId === enrollment.courseId &&
            res.studentId === user.id &&
            res.passed,
        );
        if (!result?.submittedAt) return null;

        return {
          course,
          issuedOn: new Date(result.submittedAt),
          score: result?.score,
          total: result?.total,
        };
      })
      .filter(Boolean);
  }, []);

  if (!certificates.length) {
    return (
      <div className="certificates-page">
        <div className="certificates-header">
          <h2>Certificates</h2>
          <p>You have not completed any certificates yet.</p>
        </div>
        <div className="empty-state">
          <p>
            Finish a course and pass the assessment to unlock your
            certificates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="certificates-page">
      <div className="certificates-header">
        <h2>Your Certificates</h2>
        <p>Track every completed certification in one place.</p>
      </div>
      <div className="certificates-grid">
        {certificates.map((certificate) => (
          <div className="certificate-card" key={certificate.course.id}>
            <div className="certificate-card-header">
              <div>
                <h3>{certificate.course.courseName}</h3>
                <p>Instructor: {certificate.course.instructor}</p>
              </div>
              <span className="badge">Completed</span>
            </div>
            <div className="certificate-meta">
              <div>
                <span>Issued</span>
                <strong>
                  {certificate.issuedOn?.toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })}
                </strong>
              </div>
              <div>
                <span>Score</span>
                <strong>
                  {certificate.score}/{certificate.total}
                </strong>
              </div>
            </div>
            <div className="certificate-actions">
              <button
                className="primary"
                onClick={() =>
                  navigate(
                    `/student-layout/download-certificate/${certificate.course.id}`,
                  )
                }
              >
                Download PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Certificates;
