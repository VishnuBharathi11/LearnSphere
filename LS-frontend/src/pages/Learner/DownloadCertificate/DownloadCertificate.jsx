import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./DownloadCertificate.scss";
import certificateImage from "../../../assets/Learner/certificate.png";
import { buildCourseLearningStateFromApi } from "../../../services/learnerProgressStore";
import { getCourseById, getCourseLessons } from "../../../services/courseApi";
import { getCourseProgress } from "../../../services/progressApi";
import { useCurrentUser } from "../../../hooks/useCurrentUser";

function DownloadCertificate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { currentUser } = useCurrentUser();
  const userId = currentUser?.id || currentUser?.userId || "";
  const [courseName, setCourseName] = useState("");
  const [courseLessons, setCourseLessons] = useState([]);
  const [courseProgress, setCourseProgress] = useState(null);

  useEffect(() => {
    let active = true;
    async function loadCourse() {
      if (!id) return;
      try {
        const course = await getCourseById(String(id));
        if (!active) return;
        setCourseName(course?.courseName || "");
      } catch {
        if (!active) return;
        setCourseName("");
      }
    }
    loadCourse();
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!id || !userId) return;
    let active = true;
    async function loadProgress() {
      try {
        const [lessons, progress] = await Promise.all([
          getCourseLessons(String(id)),
          getCourseProgress(String(userId), String(id)),
        ]);
        if (!active) return;
        setCourseLessons(Array.isArray(lessons) ? lessons : []);
        setCourseProgress(progress);
      } catch {
        if (!active) return;
        setCourseLessons([]);
        setCourseProgress(null);
      }
    }
    loadProgress();
    return () => {
      active = false;
    };
  }, [id, userId]);

  const certificate = useMemo(() => {
    if (!userId || !id) return null;

    const state = buildCourseLearningStateFromApi(courseLessons, courseProgress);
    if (!state.certificateUnlocked) return null;

    return {
      courseName: courseName || `Course #${id}`,
      learnerName: currentUser?.name || currentUser?.username || "Learner",
      issuedDate: new Date(state.progress.finalAssessment?.submittedAt || Date.now()).toDateString(),
      certificateId: `LS-${id}-${String(userId)}`,
    };
  }, [courseLessons, courseProgress, courseName, currentUser?.name, currentUser?.username, id, userId]);

  const handleDownload = async () => {
    if (!certificate) return;

    const image = new Image();
    image.src = certificateImage;

    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const textColor = "#2f3e67";
    const centerX = canvas.width * 0.34;
    const learnerY = canvas.height * 0.485;
    const courseY = canvas.height * 0.642;
    const issuedY = canvas.height * 0.785;
    const certificateIdY = canvas.height * 0.835;

    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = `${Math.max(24, Math.round(canvas.width * 0.046))}px Georgia`;
    ctx.fillText(certificate.learnerName, centerX, learnerY, canvas.width * 0.62);

    ctx.font = `${Math.max(18, Math.round(canvas.width * 0.026))}px Georgia`;
    ctx.fillText(certificate.courseName, centerX, courseY, canvas.width * 0.62);

    ctx.textAlign = "left";
    ctx.font = `${Math.max(12, Math.round(canvas.width * 0.0145))}px Arial`;
    ctx.fillText(`Issued: ${certificate.issuedDate}`, canvas.width * 0.08, issuedY, canvas.width * 0.56);
    ctx.fillText(
      `Certificate ID: ${certificate.certificateId}`,
      canvas.width * 0.08,
      certificateIdY,
      canvas.width * 0.7
    );

    const downloadLink = document.createElement("a");
    downloadLink.href = canvas.toDataURL("image/png");
    downloadLink.download = `${certificate.courseName.replace(/[^a-zA-Z0-9-_ ]/g, "")} Certificate.png`;
    downloadLink.click();
  };

  if (!certificate) {
    return (
      <div className="download-certificate-page">
        <div className="download-certificate-header">
          <div>
            <h2>Certificate Locked</h2>
          </div>
        </div>
        <div className="download-certificate-layout" style={{ gridTemplateColumns: "1fr" }}>
          <div className="download-certificate-locked-state">
            <div className="download-certificate-lock-icon">🔒</div>
            <h3>Certificate Not Yet Available</h3>
            <p>To unlock your certificate, you need to:</p>
            <ul className="unlock-requirements">
              <li>Complete <strong>100% of all lessons</strong></li>
              <li>Pass the <strong>final assessment</strong></li>
            </ul>
            <p className="current-status">Keep up the great work! You're making progress.</p>
            <button 
              className="download-cert-btn" 
              onClick={() => navigate("/student-layout/my-courses")}
              style={{ marginTop: "24px" }}
            >
              Continue Learning
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="download-certificate-page">
      <div className="download-certificate-header">
        <div>
          <h2>{certificate.courseName} Certificate</h2>
        </div>
      </div>

      <div className="download-certificate-layout">
        <div className="download-certificate-preview">
          <div className="download-certificate-template">
            <img src={certificateImage} alt="Certificate" className="download-certificate-image" />
            <div className="download-certificate-overlay download-certificate-learner">{certificate.learnerName}</div>
            <div className="download-certificate-overlay download-certificate-course">{certificate.courseName}</div>
            <div className="download-certificate-overlay download-certificate-issued">Issued: {certificate.issuedDate}</div>
            <div className="download-certificate-overlay download-certificate-id">Certificate ID: {certificate.certificateId}</div>
          </div>
        </div>

        <div className="download-certificate-actions">
          <div className="download-cert-meta">
            <p>
              <span>Course</span>
              <strong>{certificate.courseName}</strong>
            </p>
            <p>
              <span>Learner</span>
              <strong>{certificate.learnerName}</strong>
            </p>
            <p>
              <span>Issued</span>
              <strong>{certificate.issuedDate}</strong>
            </p>
            <p>
              <span>Certificate</span>
              <strong>{certificate.certificateId}</strong>
            </p>
          </div>

          <div className="download-cert-action-row">
            <button className="download-cert-btn" onClick={handleDownload} title="Download certificate as PNG image">
              📥 Download Certificate
            </button>
            <button
              className="download-cert-share-btn"
              onClick={() =>
                window.open(
                  "https://www.linkedin.com/sharing/share-offsite/?url=https://learnsphere.com",
                  "_blank"
                )
              }
              title="Share your achievement on LinkedIn"
            >
              💼 Share on LinkedIn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DownloadCertificate;

