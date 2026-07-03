import { useEffect, useState } from "react";
import "./ColdStartNotice.scss";

const COLD_START_EVENT = "learnsphere:cold-start";

export function ColdStartNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleColdStart = (event) => setVisible(Boolean(event.detail?.active));
    window.addEventListener(COLD_START_EVENT, handleColdStart);
    return () => window.removeEventListener(COLD_START_EVENT, handleColdStart);
  }, []);

  if (!visible) return null;

  return (
    <div className="cold-start-notice" role="status" aria-live="polite">
      Server is starting. Please wait a few seconds.
    </div>
  );
}
