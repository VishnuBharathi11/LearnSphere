import { useState } from "react";
import { SendHorizontal } from "lucide-react";
import RichTextEditor from "./RichTextEditor";

const ReplyBox = ({ onSubmit, placeholder = "Write a reply...", buttonLabel = "Reply" }) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const plain = String(value || "").replace(/<[^>]*>/g, "").trim();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!plain) {
      setError("Reply cannot be empty.");
      return;
    }

    const result = await onSubmit(value.trim());

    if (result?.ok) {
      setValue("");
      setError("");
      return;
    }

    setError(result?.error || "Unable to post reply.");
  };

  return (
    <form className="forum-reply-box" onSubmit={handleSubmit}>
      <RichTextEditor value={value} onChange={setValue} placeholder={placeholder} />
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
