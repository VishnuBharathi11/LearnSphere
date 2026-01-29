import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./Certificate.css";

import certificateImage from "../../../assets/LearnerCertificate/certificate.jpg";

function Certificate() {
  const navigate = useNavigate();
  const location = useLocation();

  const courseName =
    location.state?.courseName || "SQL (Basic)";

  return (
    <div className="certificate-page">

      {/* ===== HEADER ===== */}
      <div className="certificate-header">
        <button
          className="back-btn"
          onClick={() => navigate("/learner-my-courses")}
        >
          <FaArrowLeft /> Back
        </button>

        <div>
          <p className="cert-sub">Certification Tests</p>
          <h2>{courseName} Certificate</h2>
        </div>
      </div>

      {/* ===== BODY ===== */}
      <div className="certificate-layout">

        {/* LEFT — CERTIFICATE IMAGE */}
        <div className="certificate-preview">
          <img
            src={certificateImage}
            alt="Certificate"
            className="certificate-image"
          />
        </div>

        {/* RIGHT — ACTIONS */}
        <div className="certificate-actions">
          <h3>Share this Certificate</h3>

          <input
            readOnly
            value="https://learnsphere.com/certificates/123456"
          />

          <h4>Iframe Link</h4>

          <input
            readOnly
            value="https://learnsphere.com/certificates/embed/123456"
          />

          {/* DOWNLOAD IMAGE */}
          <a
            href={certificateImage}
            download={`${courseName}-certificate.png`}
            className="download-btn"
          >
            ⬇ Download Certificate
          </a>

          <div className="cert-info">
            <h4>{courseName}</h4>
            <p>
              This certificate verifies successful completion of the
              assessment.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Certificate;
