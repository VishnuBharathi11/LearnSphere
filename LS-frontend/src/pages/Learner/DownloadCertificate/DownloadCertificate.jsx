import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./DownloadCertificate.scss";
import certificateImage from "../../../assets/Learner/certificate.png";
import { buildCourseLearningState } from "../../../services/learnerProgressStore";
import { getCourseById } from "../../../services/courseApi";
import { getCurrentUser } from "../../../services/userProfileStore.js";

function DownloadCertificate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const currentUser = getCurrentUser();
  const userId = currentUser?.id || currentUser?.userId || "";
  const [courseName, setCourseName] = useState("");

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

  const certificate = useMemo(() => {
    if (!userId || !id) return null;

    const state = buildCourseLearningState(userId, id);
    if (!state.certificateUnlocked) return null;

    return {
      courseName: courseName || `Course #${id}`,
      learnerName: currentUser?.name || currentUser?.username || "Learner",
      issuedDate: new Date(state.progress.finalAssessment?.submittedAt || Date.now()).toDateString(),
      certificateId: `LS-${id}-${String(userId)}`,
    };
  }, [courseName, currentUser?.name, currentUser?.username, id, userId]);

  const handleDownload = () => {
    if (!certificate) return;

    const printable = window.open("", "_blank");
    if (!printable) return;

    printable.document.write(`
      <html>
        <head>
          <title>${certificate.courseName} Certificate</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; text-align: center; }
            img { max-width: 700px; width: 100%; border: 1px solid #ddd; border-radius: 12px; }
            h1 { margin-bottom: 8px; }
            p { color: #475569; margin: 6px 0; }
          </style>
        </head>
        <body>
          <h1>${certificate.courseName} Certificate</h1>
          <img src="${certificateImage}" alt="Certificate" />
          <p>Learner: ${certificate.learnerName}</p>
          <p>Issued: ${certificate.issuedDate}</p>
          <p>Certificate ID: ${certificate.certificateId}</p>
        </body>
      </html>
    `);

    printable.document.close();
    printable.print();
  };

  if (!certificate) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Certificate Locked</h2>
        <p>You must complete 100% lessons and pass final assessment.</p>
        <button onClick={() => navigate("/student-layout/my-courses")}>Go to My Courses</button>
      </div>
    );
  }

  return (
    <div className="certificate-page">
      <div className="certificate-header">
        <div>
          <h2>{certificate.courseName} Certificate</h2>
        </div>
      </div>

      <div className="certificate-layout">
        <div className="certificate-preview">
          <img src={certificateImage} alt="Certificate" className="certificate-image" />
        </div>

        <div className="certificate-actions">
          <div className="cert-meta">
            <p>
              <span>Course</span>
              {certificate.courseName}
            </p>
            <p>
              <span>Learner</span>
              {certificate.learnerName}
            </p>
            <p>
              <span>Issued</span>
              {certificate.issuedDate}
            </p>
            <p>
              <span>Certificate</span>
              {certificate.certificateId}
            </p>
          </div>

          <button className="download-btn" onClick={handleDownload}>
            Download PDF
          </button>
          <button
            className="share-btn"
            onClick={() =>
              window.open(
                "https://www.linkedin.com/sharing/share-offsite/?url=https://learnsphere.com",
                "_blank"
              )
            }
          >
            Share on LinkedIn
          </button>
        </div>
      </div>
    </div>
  );
}

export default DownloadCertificate;

