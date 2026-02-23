import { useState } from "react";

const CreateTopicModal = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    if (!cleanTitle || !cleanContent) {
      setError("Title and content are required.");
      return;
    }

    const result = onCreate({ title: cleanTitle, content: cleanContent });

    if (result?.ok) {
      setTitle("");
      setContent("");
      setError("");
      onClose();
      return;
    }

    setError(result?.error || "Unable to create topic.");
  };

  return (
    <div className="forum-modal-backdrop" onClick={onClose}>
      <div className="forum-modal" onClick={(event) => event.stopPropagation()}>
        <h3>Create Topic</h3>

        <form onSubmit={handleSubmit}>
          <label htmlFor="forum-topic-title">Title</label>
          <input
            className="forum-input"
            id="forum-topic-title"
            type="text"
            maxLength={120}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter topic title"
          />

          <label htmlFor="forum-topic-content">Description</label>
          <textarea
            className="forum-input"
            id="forum-topic-content"
            maxLength={2500}
            rows={6}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Describe your question or discussion"
          />

          {error ? <p className="forum-error">{error}</p> : null}

          <div className="forum-modal-actions">
            <button
              type="button"
              className="forum-btn ghost"
              onClick={onClose}
              title="Cancel"
              aria-label="Cancel"
            >
              Cancel
            </button>
            <button
              className="forum-btn forum-btn-primary"
              type="submit"
              title="Create topic"
              aria-label="Create topic"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTopicModal;
