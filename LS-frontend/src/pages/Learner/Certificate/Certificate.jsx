import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Certificate.scss";
import certificateImage from "../../../assets/Learner/certificate.png";

function Certificate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const currentUser = JSON.parse(window.appStore.getItem("currentUser") || "null");
  const userId = currentUser?.id || currentUser?.userId || "";

  const certificates = useMemo(() => {
    if (!userId) return [];

    const results = JSON.parse(window.appStore.getItem("testResults") || "[]");
    const enrolled = JSON.parse(window.appStore.getItem("enrolledCourses") || "[]");
    const courses = JSON.parse(window.appStore.getItem("courses") || "[]");

    return results
      .filter((result) => String(result.studentId) === String(userId) && result.passed)
      .map((result) => {
        const enrollment = enrolled.find(
          (item) =>
            String(item.courseId) === String(result.courseId) &&
            String(item.studentId || item.userId) === String(userId)
        );
        const progress = Number(enrollment?.progress || 0);
        const eligible = progress >= 100;

        const course =
          courses.find((item) => String(item.id) === String(result.courseId)) ||
          ({ courseName: `Course #${result.courseId}` });

        return {
          id: String(result.courseId),
          courseName: course.courseName,
          learnerName: currentUser?.name || currentUser?.username || "Learner",
          issuedDate: new Date(result.submittedAt || Date.now()).toDateString(),
          certificateId: `LS-${result.courseId}-${String(userId)}`,
          eligible,
        };
      })
      .filter((item) => item.eligible);
  }, [currentUser?.name, currentUser?.username, userId]);

  const activeCertificate = useMemo(() => {
    if (!id) return null;
    return certificates.find((item) => String(item.id) === String(id)) || null;
  }, [certificates, id]);

  const handleDownload = (certificate) => {
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

  if (!id) {
    return (
      <div className="certificate-page">
        <div className="certificate-header">
          <div>
            <h2>My Certificates</h2>
            <p>All completed courses with passed assessments.</p>
          </div>
        </div>

        <div className="certificate-list">
          {certificates.length === 0 ? (
            <div className="certificate-empty">
              <h3>No certificates yet</h3>
              <p>Complete a course and pass assessment to unlock certificates.</p>
              <button onClick={() => navigate("/student-layout/my-courses")}>Go to My Courses</button>
            </div>
          ) : (
            certificates.map((certificate) => (
              <div key={certificate.id} className="certificate-list-card">
                <div>
                  <h4>{certificate.courseName}</h4>
                  <p>{certificate.issuedDate}</p>
                </div>
                <div className="certificate-list-actions">
                  <button onClick={() => navigate(`/student-layout/certificate/${certificate.id}`)}>View</button>
                  <button onClick={() => handleDownload(certificate)}>Download</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (!activeCertificate) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Certificate Locked</h2>
        <p>You must complete the course and pass assessment.</p>
        <button onClick={() => navigate("/student-layout/my-courses")}>Go to My Courses</button>
      </div>
    );
  }

  return (
    <div className="certificate-page">
      <div className="certificate-header">
        <div>
          <h2>{activeCertificate.courseName} Certificate</h2>
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
              {activeCertificate.courseName}
            </p>
            <p>
              <span>Learner</span>
              {activeCertificate.learnerName}
            </p>
            <p>
              <span>Issued</span>
              {activeCertificate.issuedDate}
            </p>
            <p>
              <span>Certificate</span>
              {activeCertificate.certificateId}
            </p>
          </div>
          <button className="download-btn" onClick={() => handleDownload(activeCertificate)}>
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

export default Certificate;
