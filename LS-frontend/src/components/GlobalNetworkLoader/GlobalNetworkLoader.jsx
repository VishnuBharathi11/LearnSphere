import "./GlobalNetworkLoader.scss";

function GlobalNetworkLoader({ active = false }) {
  if (!active) return null;

  return (
    <div className="global-network-loader" role="status" aria-live="polite">
      <div className="learnsphere-loader" aria-label="Loading LearnSphere">
        <span className="learnsphere-loader-letter" aria-hidden="true">
          L
        </span>
      </div>
    </div>
  );
}

export default GlobalNetworkLoader;
