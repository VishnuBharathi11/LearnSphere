import React, { useState, useEffect } from "react";
import { getContactSubmissions, deleteContactSubmission } from "../../../services/contactService";
import { Trash2, Mail, Calendar, MessageSquare, AlertCircle } from "lucide-react";
import "./ContactSubmissions.scss";

function ContactSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = () => {
    try {
      const data = getContactSubmissions();
      // Sort by date descending (newest first)
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setSubmissions(data);
    } catch (err) {
      setError("Failed to load contact submissions.");
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this contact submission?")) {
      try {
        deleteContactSubmission(id);
        loadSubmissions();
      } catch (err) {
        setError("Failed to delete contact submission.");
      }
    }
  };

  return (
    <div className="contact-submissions-page">
      {error && <p className="admin-error">{error}</p>}
      
      <div className="ia-stats" style={{ marginBottom: '24px' }}>
        <div className="ia-stat-card">
          <span>Total Messages</span>
          <strong>{submissions.length}</strong>
        </div>
        <div className="ia-stat-card highlight">
          <span>Active Queries</span>
          <strong>{submissions.filter(s => !s.resolved).length}</strong>
        </div>
      </div>

      <div className="ia-table">
        <table>
          <thead>
            <tr>
              <th>Sender</th>
              <th>Subject</th>
              <th>Received Date</th>
              <th>Message</th>
              <th className="review-col">Action</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-table-cell" style={{ textAlign: "center", padding: "40px" }}>
                  <AlertCircle size={24} style={{ color: "#a435f0", marginBottom: "8px" }} />
                  <p style={{ color: "#6a6f73", fontSize: "14px", fontWeight: "500" }}>No contact submissions found.</p>
                </td>
              </tr>
            ) : (
              submissions.map((sub) => (
                <tr key={sub.id}>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <strong style={{ color: "#1c1d1f" }}>{sub.name}</strong>
                      <span style={{ fontSize: "12px", color: "#6a6f73" }}>{sub.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className="subject-badge">{sub.subject || "General Inquiry"}</span>
                  </td>
                  <td>
                    <span className="date-display">
                      {new Date(sub.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </td>
                  <td>
                    <p className="message-preview" title={sub.message}>
                      {sub.message}
                    </p>
                  </td>
                  <td className="review-col">
                    <button 
                      className="delete-sub-btn" 
                      onClick={() => handleDelete(sub.id)}
                      title="Delete Submission"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ContactSubmissions;
