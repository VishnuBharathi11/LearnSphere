import { useState } from "react";
import { SendHorizontal } from "lucide-react";

const ReplyBox = ({ onSubmit, placeholder = "Write a reply...", buttonLabel = "Reply" }) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const content = value.trim();

    if (!content) {
      setError("Reply cannot be empty.");
      return;
    }

    const result = onSubmit(content);

    if (result?.ok) {
      setValue("");
      setError("");
      return;
    }

    setError(result?.error || "Unable to post reply.");
  };

  return (
    <form className="forum-reply-box" onSubmit={handleSubmit}>
      <textarea
        className="forum-input"
        rows={3}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        maxLength={1800}
      />
      {error ? <p className="forum-error">{error}</p> : null}
      <div className="forum-reply-box-actions">
        <button
          className="forum-btn forum-btn-primary forum-btn-icon"
          type="submit"
          title={buttonLabel}
          aria-label={buttonLabel}
        >
          <SendHorizontal size={15} />
        </button>
      </div>
    </form>
  );
};

export default ReplyBox;
