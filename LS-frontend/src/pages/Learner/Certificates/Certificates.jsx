import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPublishedCourses } from "../../../services/courseApi";
import { getEnrollmentsByCourses } from "../../../services/enrollmentApi";
import "./Certificates.scss";

function Certificates() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(window.appStore.getItem("currentUser") || "null");
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

  const certificates = useMemo(() => {
    if (!userId) return [];
    return enrollments
      .filter(
        (enrollment) =>
          String(enrollment.userId) === userId &&
          String(enrollment.status || "").toUpperCase() === "ACTIVE" &&
          Number(enrollment.progressPercentage || 0) >= 100
      )
      .map((enrollment) => {
        const course = courses.find((c) => String(c.id) === String(enrollment.courseId));
        if (!course) return null;

        return {
          course,
          issuedOn: new Date(enrollment.updatedAt || enrollment.createdAt || Date.now()),
          score: Number(enrollment.progressPercentage || 100),
          total: 100,
        };
      })
      .filter(Boolean);
  }, [courses, enrollments, userId]);

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
