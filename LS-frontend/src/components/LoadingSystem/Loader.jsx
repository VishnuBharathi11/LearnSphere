import "./Loader.scss";

function Loader({ active = false, subtitle = "Preparing your learning experience...", reducedMotion = false }) {
  if (!active) return null;

  return (
    <div className="learnsphere-loader-overlay" role="status" aria-live="polite">
      <div className="learnsphere-loader-frame">
        <div className="learnsphere-loader-scene">
          <div className={`learnsphere-loader-orbit ${reducedMotion ? "reduced-motion" : ""}`}>
            <div className="learnsphere-orbit-ring" aria-hidden="true" />
            <div className="learnsphere-sphere" aria-hidden="true">
              <div className="learnsphere-sphere-gloss" />
              <span className="learnsphere-sphere-mark">LS</span>
            </div>
          </div>
        </div>

        <div className="learnsphere-loader-copy">
          <h1>LearnSphere</h1>
          <p>{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

export default Loader;
