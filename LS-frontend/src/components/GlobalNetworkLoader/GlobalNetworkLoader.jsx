import { useEffect, useState } from "react";
import {
  getNetworkActivityCount,
  subscribeNetworkActivity,
} from "../../services/networkActivityStore";
import "./GlobalNetworkLoader.scss";

const SHOW_DELAY_MS = 300;

function GlobalNetworkLoader() {
  const [activeCount, setActiveCount] = useState(getNetworkActivityCount());
  const [visible, setVisible] = useState(false);

  useEffect(() => subscribeNetworkActivity(setActiveCount), []);

  useEffect(() => {
    let timerId;
    if (activeCount > 0) {
      timerId = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    } else {
      setVisible(false);
    }
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [activeCount]);

  if (!visible) return null;

  return (
    <div className="global-network-loader" role="status" aria-live="polite">
      <div className="global-network-loader-card">
        <div className="loader-wave" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <div className="loader-shadow" />
        </div>
        <p>LOADING</p>
      </div>
    </div>
  );
}

export default GlobalNetworkLoader;
