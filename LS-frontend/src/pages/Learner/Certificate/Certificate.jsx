import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Certificate.scss";
import certificateImage from "../../../assets/Learner/certificate.png";
function Certificate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { eligible, courseName, learnerName, issuedDate } = useMemo(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    const enrolled = JSON.parse(localStorage.getItem("enrolledCourses")) || [];
    const results = JSON.parse(localStorage.getItem("testResults")) || [];
    const courses = JSON.parse(localStorage.getItem("courses")) || [];
    if (!user) return { eligible: false };
    const enrollment = enrolled.find(
      (e) => e.courseId === Number(id) && e.studentId === user.id,
    );
    const result = results.find(
      (r) => r.courseId === Number(id) && r.studentId === user.id,
    );
    if (!result || result.passed) {
      return (
        <p style={{ padding: 40 }}>
          Certificate locked. Pass assessment first.
        </p>
      );
    }
    const course = courses.find((c) => c.id === Number(id));
    const progressComplete =
      enrollment && enrollment.completedLessons === enrollment.totalLessons;
    const passed = result && result.passed === true;
    return {
      eligible: progressComplete && passed,
      courseName: course?.courseName || "Course",
      learnerName: user.name || "Learner",
      issuedDate: new Date().toDateString(),
    };
  }, [id]);
  if (!eligible) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Certificate Locked</h2>
        <p>You must complete all lessons and pass the assessment.</p>
        <button onClick={() => navigate("/student-layout/my-courses")}>
          Go to My Courses
        </button>
      </div>
    );
  }
  const handleDownload = async () => {
    try {
      const response = await fetch(
        `https://localhost:8080/api/certificate/${id}`,
        { method: "GET", headers: { Accept: "application/pdf" } },
      );

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${courseName}-certificate.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Unable to download certificate");
    }
  };
  return (
    <div className="certificate-page">
      <div className="certificate-header">
        <div>
          <h2>{courseName} Certificate</h2>
        </div>
      </div>
      <div className="certificate-layout">
        <div className="certificate-preview">
          <img
            src={certificateImage}
            alt="Certificate"
            className="certificate-image"
          />
        </div>
        <div className="certificate-actions">
          <div className="cert-meta">
            <p>
              <span>Course</span>
              {courseName}
            </p>
            <p>
              <span>Learner</span>
              {learnerName}
            </p>
            <p>
              <span>Issued</span>
              {issuedDate}
            </p>
            <p>
              <span>Certificate</span>LS-{Date.now()}
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
                "_blank",
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
