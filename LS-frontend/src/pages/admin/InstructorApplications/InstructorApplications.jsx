import { useEffect, useMemo, useState } from "react";
import { FileText, Search, Eye } from "lucide-react";
import {
  approveInstructorApplication,
  getInstructorApplicationResume,
  getInstructorApplications,
  rejectInstructorApplication,
} from "../../../services/authApi";
import { getFriendlyErrorMessage } from "../../../services/apiError";
import "./InstructorApplications.scss";

function InstructorApplications() {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [showApprove, setShowApprove] = useState(false);
  const [approveEmail, setApproveEmail] = useState("");
  const [approvePassword, setApprovePassword] = useState("");
  const [processing, setProcessing] = useState(false);

  const loadApplications = async () => {
    try {
      const list = await getInstructorApplications();
      setApplications(Array.isArray(list) ? list : []);
      setError("");
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError, "Failed to load applications"));
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const filteredApplications = useMemo(() => {
    const term = search.toLowerCase();
    return applications.filter((app) => {
      return (
        String(app.name || "").toLowerCase().includes(term) ||
        String(app.email || "").toLowerCase().includes(term) ||
        String(app.expertise || "").toLowerCase().includes(term)
      );
    });
  }, [applications, search]);

  const stats = useMemo(() => {
    const pending = applications.filter((app) => String(app.status).toUpperCase() === "PENDING")
      .length;
    const approved = applications.filter((app) => String(app.status).toUpperCase() === "APPROVED")
      .length;
    const rejected = applications.filter((app) => String(app.status).toUpperCase() === "REJECTED")
      .length;
    const reviewed = approved + rejected;
    const approvalRate = reviewed === 0 ? 0 : Math.round((approved / reviewed) * 100);
    return { pending, approved, rejected, approvalRate };
  }, [applications]);

  const openReview = (app) => {
    setSelected(app);
    setShowReview(true);
    setApproveEmail(app?.email || "");
    setApprovePassword("");
  };

  const closeReview = () => {
    setShowReview(false);
    setSelected(null);
  };

  const handleViewResume = async () => {
    if (!selected?.id) return;
    try {
      const response = await getInstructorApplicationResume(selected.id);
      const contentType = response.headers?.["content-type"] || "application/pdf";
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError, "Failed to load resume"));
    }
  };

  const handleReject = async () => {
    if (!selected?.id) return;
    if (!window.confirm("Reject this instructor application?")) return;
    try {
      setProcessing(true);
      await rejectInstructorApplication(selected.id);
      await loadApplications();
      closeReview();
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError, "Failed to reject application"));
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async () => {
    if (!selected?.id) return;
    if (!approveEmail || !approvePassword) {
      setError("Email and password are required to approve.");
      return;
    }
    try {
      setProcessing(true);
      await approveInstructorApplication(selected.id, {
        email: approveEmail,
        password: approvePassword,
      });
      await loadApplications();
      setShowApprove(false);
      closeReview();
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError, "Failed to approve application"));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="instructor-applications-page">
      {error && <p className="admin-error">{error}</p>}

      <div className="ia-header">
        <div>
          <h2>Instructor Registration</h2>
          <p>Review and approve instructor applications submitted by users.</p>
        </div>
        <div className="ia-search">
          <Search size={16} />
          <input
            placeholder="Search by name, email, expertise"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="ia-stats">
        <div className="ia-stat-card">
          <span>Pending Approval</span>
          <strong>{stats.pending}</strong>
        </div>
        <div className="ia-stat-card">
          <span>Total Approved</span>
          <strong>{stats.approved}</strong>
        </div>
        <div className="ia-stat-card">
          <span>Total Rejected</span>
          <strong>{stats.rejected}</strong>
        </div>
        <div className="ia-stat-card highlight">
          <span>Approval Rate</span>
          <strong>{stats.approvalRate}%</strong>
        </div>
      </div>

      <div className="ia-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email Address</th>
              <th>Expertise</th>
              <th className="status-col">Status</th>
              <th>Submitted</th>
              <th className="review-col">Review</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty">
                  <FileText size={32} />
                  No applications found
                </td>
              </tr>
            ) : (
              filteredApplications.map((app) => (
                <tr key={app.id}>
                  <td>{app.name}</td>
                  <td>{app.email}</td>
                  <td>{app.expertise}</td>
                  <td className="status-cell">
                    <span className={`status ${String(app.status || "").toLowerCase()}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "-"}</td>
                  <td className="review-cell">
                    <button className="review-btn" onClick={() => openReview(app)}>
                      <Eye size={16} />
                      Review
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showReview && selected && (
        <div className="ia-modal-overlay" onClick={closeReview}>
          <div className="ia-modal" onClick={(event) => event.stopPropagation()}>
            <div className="ia-modal-header">
              <h3>Application Review</h3>
              <button type="button" onClick={closeReview}>
                Close
              </button>
            </div>
            <div className="ia-modal-body">
              <div className="ia-details">
                <div>
                  <span>Full Name</span>
                  <strong>{selected.name}</strong>
                </div>
                <div>
                  <span>Email</span>
                  <strong>{selected.email}</strong>
                </div>
                <div>
                  <span>Phone</span>
                  <strong>{selected.phone}</strong>
                </div>
                <div>
                  <span>Date of Birth</span>
                  <strong>{selected.dateOfBirth || "-"}</strong>
                </div>
                <div>
                  <span>Expertise</span>
                  <strong>{selected.expertise}</strong>
                </div>
                <div>
                  <span>LinkedIn</span>
                  <strong>{selected.linkedin}</strong>
                </div>
              </div>
              <button className="resume-btn" onClick={handleViewResume}>
                View Resume
              </button>
            </div>
            <div className="ia-modal-actions">
              <button className="reject" onClick={handleReject} disabled={processing}>
                Reject
              </button>
              <button
                className="approve"
                onClick={() => setShowApprove(true)}
                disabled={processing}
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {showApprove && selected && (
        <div className="ia-modal-overlay" onClick={() => setShowApprove(false)}>
          <div className="ia-modal" onClick={(event) => event.stopPropagation()}>
            <div className="ia-modal-header">
              <h3>Create Instructor Login</h3>
              <button type="button" onClick={() => setShowApprove(false)}>
                Close
              </button>
            </div>
            <div className="ia-modal-body">
              <label>
                Registered Email
                <input
                  type="email"
                  value={approveEmail}
                  onChange={(event) => setApproveEmail(event.target.value)}
                />
              </label>
              <label>
                Set Password
                <input
                  type="text"
                  value={approvePassword}
                  onChange={(event) => setApprovePassword(event.target.value)}
                />
              </label>
              <div className="hint">
                If the email already exists, the account will be upgraded to Instructor.
              </div>
            </div>
            <div className="ia-modal-actions">
              <button className="approve" onClick={handleApprove} disabled={processing}>
                Approve and Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InstructorApplications;
