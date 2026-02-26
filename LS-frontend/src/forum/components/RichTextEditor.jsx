import { useMemo, useRef, useState } from "react";
import { Bold, Italic, List } from "lucide-react";

const sanitizeEditor = (value) =>
  String(value || "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+\s*=\s*"[^"]*"/gi, "");

const RichTextEditor = ({ value, onChange, placeholder = "Type here..." }) => {
  const editorRef = useRef(null);
  const [focused, setFocused] = useState(false);

  const normalized = useMemo(() => sanitizeEditor(value), [value]);

  const exec = (command) => {
    document.execCommand(command, false);
    const html = editorRef.current?.innerHTML || "";
    onChange(sanitizeEditor(html));
  };

  const handleInput = () => {
    const html = editorRef.current?.innerHTML || "";
    onChange(sanitizeEditor(html));
  };

  return (
    <div className={`forum-rich-editor ${focused ? "is-focused" : ""}`}>
      <div className="forum-rich-toolbar">
        <button type="button" onClick={() => exec("bold")} title="Bold" aria-label="Bold">
          <Bold size={14} />
        </button>
        <button type="button" onClick={() => exec("italic")} title="Italic" aria-label="Italic">
          <Italic size={14} />
        </button>
        <button type="button" onClick={() => exec("insertUnorderedList")} title="List" aria-label="List">
          <List size={14} />
        </button>
      </div>
      <div
        ref={editorRef}
        className="forum-rich-input"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        data-placeholder={placeholder}
        dangerouslySetInnerHTML={{ __html: normalized }}
      />
    </div>
  );
};

export default RichTextEditor;
