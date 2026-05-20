import React, { useState } from "react";
import "./InstructorApplication.scss";
import { useNavigate } from "react-router-dom";
import NavBar from "../../../components/NavBar/NavBar";
import Footer from "../../../components/Footer/Footer";
import { normalizeApiError, submitInstructorApplication } from "../../../services/authApi";

function InstructorApplication() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    expertise: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    linkedin: "",
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setResumeFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.expertise || !form.email || !form.phone || !form.dateOfBirth || !form.linkedin) {
      setError("Please complete all required fields.");
      return;
    }

    if (!resumeFile) {
      setError("Please upload your resume.");
      return;
    }

    try {
      setSubmitting(true);
      await submitInstructorApplication({
        ...form,
        resumeFile,
      });
      setSuccess("Application received. Our team will review and contact you shortly.");
      setForm({
        name: "",
        expertise: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        linkedin: "",
      });
      setResumeFile(null);
    } catch (apiError) {
      setError(normalizeApiError(apiError, "Application submission failed."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="instructor-application">
        <div className="instructor-application__header">
          <div>
            <div className="instructor-application__title">Instructor Application</div>
            <div className="instructor-application__subtitle">
              Share your expertise and help learners grow. We will review your application within 3-5
              business days.
            </div>
          </div>
          <button
            type="button"
            className="instructor-application__back"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>

        <div className="instructor-application__content">
          <form className="instructor-application__form" onSubmit={handleSubmit}>
            {error && <div className="instructor-application__alert">{error}</div>}
            {success && <div className="instructor-application__success">{success}</div>}

            <div className="instructor-application__grid">
              <label>
                Full Name*
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Field of Expertise*
                <input
                  type="text"
                  name="expertise"
                  placeholder="e.g. Data Science, UI/UX"
                  value={form.expertise}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Email Address*
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Phone Number*
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter phone number"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Date of Birth*
                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                LinkedIn Profile*
                <input
                  type="url"
                  name="linkedin"
                  placeholder="https://linkedin.com/in/username"
                  value={form.linkedin}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <div className="instructor-application__upload">
              <label>
                Resume (PDF/DOC/DOCX)*
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} required />
              </label>
              <p>Make sure your resume includes your teaching or industry experience.</p>
            </div>

            <div className="instructor-application__actions">
              <button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Send Application"}
              </button>
            </div>
          </form>

          <div className="instructor-application__tips">
            <h3>What happens next?</h3>
            <p>We verify your expertise, review your resume, and may request a short demo lesson.</p>
            <ul>
              <li>Review time: 3-5 business days.</li>
              <li>Be sure your LinkedIn profile is public.</li>
              <li>We contact you by email if we need more details.</li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default InstructorApplication;
