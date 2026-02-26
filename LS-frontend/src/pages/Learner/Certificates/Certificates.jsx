import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPublishedCourses } from "../../../services/courseApi";
import { getEnrollmentsByUser } from "../../../services/enrollmentApi";
import { buildCourseLearningState } from "../../../services/learnerProgressStore";
import certificateImage from "../../../assets/Learner/certificate.png";
import "./Certificates.scss";
import { getCurrentUser } from "../../../services/userProfileStore.js";

function Certificates() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  const currentUser = useMemo(() => {
    try {
      return getCurrentUser();
    } catch {
      return null;
    }
  }, []);
  const userId = String(currentUser?.id || currentUser?.userId || "");

  useEffect(() => {
    if (!userId) return;

    let active = true;
    async function load() {
      try {
        const [published, mine] = await Promise.all([
          getPublishedCourses(0, 300),
          getEnrollmentsByUser(userId),
        ]);
        if (!active) return;
        setCourses(Array.isArray(published) ? published : []);
        setEnrollments(Array.isArray(mine) ? mine : []);
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

  const certificateCards = useMemo(() => {
    if (!userId) return [];

    return enrollments
      .filter(
        (enrollment) =>
          String(enrollment.userId) === userId && String(enrollment.status || "").toUpperCase() === "ACTIVE"
      )
      .map((enrollment) => {
        const course = courses.find((c) => String(c.id) === String(enrollment.courseId));
        if (!course) return null;

        const state = buildCourseLearningState(userId, course.id);
        return {
          course,
          issuedOn: state.progress.finalAssessment?.submittedAt
            ? new Date(state.progress.finalAssessment.submittedAt)
            : null,
          unlocked: state.certificateUnlocked,
          progress: state.progressPercentage,
        };
      })
      .filter(Boolean);
  }, [courses, enrollments, userId]);

  if (!certificateCards.length) {
    return (
      <div className="certificates-page">
        <div className="certificates-header">
          <h2>Certificates</h2>
          <p>You have not enrolled in courses yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="certificates-page">
      <div className="certificates-header">
        <h2>Your Certificates</h2>
        <p>Certificates unlock only after 100% course completion and passing final assessment.</p>
      </div>
      <div className="certificates-grid">
        {certificateCards.map((certificate) => (
          <div className="certificate-card" key={certificate.course.id}>
            <div className="certificate-card-header">
              <div>
                <h3>{certificate.course.courseName}</h3>
                <p>Instructor: {certificate.course.instructor}</p>
              </div>
              <span className="badge">{certificate.unlocked ? "Unlocked" : "Locked"}</span>
            </div>
            <div className={`certificate-preview-wrap ${certificate.unlocked ? "unlocked" : "locked"}`}>
              <img src={certificateImage} alt="Certificate Preview" className="certificate-preview-image" />
              {!certificate.unlocked ? (
                <div className="certificate-lock-overlay">
                  <span className="lock-icon">LOCKED</span>
                </div>
              ) : null}
            </div>
            <div className="certificate-meta">
              <div>
                <span>Status</span>
                <strong>{certificate.unlocked ? "Ready" : `Progress ${certificate.progress}%`}</strong>
              </div>
              <div>
                <span>Issued</span>
                <strong>
                  {certificate.issuedOn
                    ? certificate.issuedOn.toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })
                    : "-"}
                </strong>
              </div>
            </div>
            <div className="certificate-actions">
              <button
                className="primary"
                disabled={!certificate.unlocked}
                onClick={() => navigate(`/student-layout/download-certificate/${certificate.course.id}`)}
              >
                {certificate.unlocked ? "Download PDF" : "Locked"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Certificates;

