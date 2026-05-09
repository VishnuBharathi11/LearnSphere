import { useEffect, useMemo, useState } from "react";

const TEXT_DELAY_MS = 140;
const CONTAINER_DELAY_MS = 320;
const IMAGE_DELAY_MS = 620;

export function useProgressiveReveal({
  isLoading,
  hasData,
  hold = false,
  totalItems = 0,
  initialCount = 2,
}) {
  const [phase, setPhase] = useState("structure");

  useEffect(() => {
    if (hold || isLoading || !hasData) {
      setPhase("structure");
      return undefined;
    }

    setPhase("structure");

    const textTimer = window.setTimeout(() => setPhase("text"), TEXT_DELAY_MS);
    const containerTimer = window.setTimeout(() => setPhase("containers"), CONTAINER_DELAY_MS);
    const imageTimer = window.setTimeout(() => setPhase("images"), IMAGE_DELAY_MS);

    return () => {
      window.clearTimeout(textTimer);
      window.clearTimeout(containerTimer);
      window.clearTimeout(imageTimer);
    };
  }, [hasData, hold, isLoading]);

  return useMemo(() => {
    const safeInitialCount = Math.max(1, initialCount);
    const visibleCount =
      phase === "structure"
        ? 0
        : phase === "text"
          ? Math.min(totalItems, safeInitialCount)
          : totalItems;

    return {
      phase,
      showText: phase === "text" || phase === "containers" || phase === "images",
      showAllContainers: phase === "containers" || phase === "images",
      showImages: phase === "images",
      visibleCount,
    };
  }, [initialCount, phase, totalItems]);
}
