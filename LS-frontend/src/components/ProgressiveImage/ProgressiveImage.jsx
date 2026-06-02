import { useEffect, useState } from "react";
import "./ProgressiveImage.scss";
function ProgressiveImage({
  src,
  fallbackSrc = "",
  alt = "",
  className = "",
  wrapperClassName = "",
  reveal = false,
}) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(false);
  }, [reveal, src, fallbackSrc]);
  const resolvedSrc = src || fallbackSrc;
  const shouldRenderImage = reveal && Boolean(resolvedSrc);
  return (
    <div className={`progressive-image ${wrapperClassName}`.trim()}>
      {shouldRenderImage ? (
        <img
          src={resolvedSrc}
          alt={alt}
          className={`progressive-image__asset ${loaded ? "is-loaded" : ""} ${className}`.trim()}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />
      ) : null}
    </div>
  );
}
export default ProgressiveImage;
