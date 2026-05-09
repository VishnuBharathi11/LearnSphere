import { useEffect, useState } from "react";
import Skeleton from "../Skeleton/Skeleton.jsx";
import "./ProgressiveImage.scss";

function ProgressiveImage({
  src,
  fallbackSrc = "",
  alt = "",
  className = "",
  wrapperClassName = "",
  skeletonClassName = "",
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
      {!loaded ? <Skeleton className={`progressive-image__skeleton ${skeletonClassName}`.trim()} /> : null}
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
