import { useState } from "react";
import RichTextEditor from "./RichTextEditor";

const CreateTopicModal = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) {
    return null;
  }

  const plainContent = String(content || "").replace(/<[^>]*>/g, "").trim();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanTitle = title.trim();

    if (!cleanTitle || !plainContent) {
      setError("Title and content are required.");
      return;
    }

    const result = await onCreate({ title: cleanTitle, content: content.trim() });

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

          <label>Description</label>
          <RichTextEditor
            value={content}
            onChange={setContent}
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
