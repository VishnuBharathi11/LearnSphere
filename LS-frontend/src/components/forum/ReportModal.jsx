import { useState } from "react";

const ReportModal = ({ isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const value = reason.trim();
    if (!value) {
      setError("Please provide a reason.");
      return;
    }

    const result = await onSubmit(value);
    if (result?.ok) {
      setReason("");
      setError("");
      onClose();
      return;
    }

    setError(result?.error || "Unable to report.");
  };

  return (
    <div className="forum-modal-backdrop" onClick={onClose}>
      <div className="forum-modal" onClick={(event) => event.stopPropagation()}>
        <h3>Report Reply</h3>
        <form onSubmit={handleSubmit}>
          <label htmlFor="report-reason">Reason</label>
          <textarea
            id="report-reason"
            rows={5}
            maxLength={400}
            className="forum-input"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Describe what is inappropriate in this reply"
          />

          {error ? <p className="forum-error">{error}</p> : null}

          <div className="forum-modal-actions">
            <button className="forum-btn ghost" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="forum-btn forum-btn-primary" type="submit">
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
