import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import Loader from "./Loader.jsx";
import {
  getNetworkActivityCount,
  subscribeNetworkActivity,
} from "../../services/networkActivityStore";

const INITIAL_LOAD_DURATION_MS = 1800;
const ROUTE_TRANSITION_DURATION_MS = 720;
const NETWORK_VISIBILITY_DELAY_MS = 180;
const NETWORK_SETTLE_DELAY_MS = 240;
const RECONNECT_SETTLE_DELAY_MS = 1400;

const LoadingContext = createContext({
  active: false,
  initialLoadComplete: false,
  isOffline: false,
  mode: "initial",
  startLoading: () => () => {},
  stopLoading: () => {},
  withLoading: async (promiseLike) => promiseLike,
});

function getModeMeta(mode, isOffline) {
  if (isOffline || mode === "reconnecting") {
    return {
      mode: "reconnecting",
      subtitle: "Reconnecting to your learning workspace...",
      statusLabel: "LearnSphere is reconnecting to the network.",
      showProgress: true,
    };
  }

  switch (mode) {
    case "manual":
      return {
        mode: "manual",
        subtitle: "Preparing your learning experience...",
        statusLabel: "LearnSphere is loading requested content.",
        showProgress: true,
      };
    case "network":
      return {
        mode: "network",
        subtitle: "Syncing live course data...",
        statusLabel: "LearnSphere is fetching course data.",
        showProgress: true,
      };
    case "route":
      return {
        mode: "route",
        subtitle: "Preparing your learning experience...",
        statusLabel: "LearnSphere is transitioning between pages.",
        showProgress: true,
      };
    default:
      return {
        mode: "initial",
        subtitle: "Preparing your learning experience...",
        statusLabel: "LearnSphere is starting up.",
        showProgress: true,
      };
  }
}

export function LoadingProvider({ children }) {
  const location = useLocation();
  const routeKey = `${location.pathname}${location.search}${location.hash}`;
  const routeMountedRef = useRef(false);
  const mediaQueryRef = useRef(null);
  const idCounterRef = useRef(0);
  const networkLoadingRef = useRef(getNetworkActivityCount() > 0);
  const networkShowTimerRef = useRef(null);
  const networkHideTimerRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [networkLoading, setNetworkLoading] = useState(getNetworkActivityCount() > 0);
  const [isOffline, setIsOffline] = useState(typeof navigator !== "undefined" ? !navigator.onLine : false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [manualLoads, setManualLoads] = useState([]);

  useEffect(() => {
    networkLoadingRef.current = networkLoading;
  }, [networkLoading]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setInitialLoadComplete(true);
    }, INITIAL_LOAD_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!routeMountedRef.current) {
      routeMountedRef.current = true;
      return undefined;
    }

    setRouteLoading(true);
    const timeoutId = window.setTimeout(() => {
      setRouteLoading(false);
    }, ROUTE_TRANSITION_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [routeKey]);

  useEffect(() => {
    const updateNetwork = (count) => {
      if (count > 0) {
        window.clearTimeout(networkHideTimerRef.current);
        if (!networkLoadingRef.current) {
          networkShowTimerRef.current = window.setTimeout(() => {
            setNetworkLoading(true);
          }, NETWORK_VISIBILITY_DELAY_MS);
        }
        return;
      }

      window.clearTimeout(networkShowTimerRef.current);
      networkHideTimerRef.current = window.setTimeout(() => {
        setNetworkLoading(false);
      }, NETWORK_SETTLE_DELAY_MS);
    };

    updateNetwork(getNetworkActivityCount());

    const unsubscribe = subscribeNetworkActivity(updateNetwork);
    return () => {
      unsubscribe();
      window.clearTimeout(networkShowTimerRef.current);
      window.clearTimeout(networkHideTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    mediaQueryRef.current = window.matchMedia("(prefers-reduced-motion: reduce)");
    const query = mediaQueryRef.current;
    const handleChange = () => {
      setReducedMotion(query.matches);
    };

    handleChange();
    query.addEventListener("change", handleChange);

    return () => {
      query.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    const handleOffline = () => {
      window.clearTimeout(reconnectTimerRef.current);
      setIsOffline(true);
    };

    const handleOnline = () => {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = window.setTimeout(() => {
        setIsOffline(false);
      }, RECONNECT_SETTLE_DELAY_MS);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      window.clearTimeout(reconnectTimerRef.current);
    };
  }, []);

  const stopLoading = useCallback((id) => {
    setManualLoads((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const startLoading = useCallback(
    (options = {}) => {
      const id = `loader-${idCounterRef.current + 1}`;
      idCounterRef.current += 1;

      setManualLoads((current) => [
        ...current,
        {
          id,
          mode: options.mode ?? "manual",
          subtitle: options.subtitle ?? null,
          statusLabel: options.statusLabel ?? null,
          showProgress: options.showProgress ?? true,
        },
      ]);

      return () => stopLoading(id);
    },
    [stopLoading]
  );

  const withLoading = useCallback(
    async (promiseLike, options = {}) => {
      const release = startLoading(options);
      try {
        return await promiseLike;
      } finally {
        release();
      }
    },
    [startLoading]
  );

  const currentManualLoad = manualLoads[manualLoads.length - 1] ?? null;
  const overlayActive =
    !initialLoadComplete || routeLoading || networkLoading || isOffline || manualLoads.length > 0;

  const modeMeta = useMemo(() => {
    if (currentManualLoad) {
      const manualMeta = getModeMeta(currentManualLoad.mode, isOffline);
      return {
        ...manualMeta,
        subtitle: currentManualLoad.subtitle ?? manualMeta.subtitle,
        statusLabel: currentManualLoad.statusLabel ?? manualMeta.statusLabel,
        showProgress: currentManualLoad.showProgress ?? manualMeta.showProgress,
      };
    }

    if (isOffline) return getModeMeta("reconnecting", true);
    if (!initialLoadComplete) return getModeMeta("initial", false);
    if (routeLoading) return getModeMeta("route", false);
    if (networkLoading) return getModeMeta("network", false);
    return getModeMeta("initial", false);
  }, [currentManualLoad, initialLoadComplete, isOffline, routeLoading, networkLoading]);

  const value = useMemo(
    () => ({
      active: overlayActive,
      initialLoadComplete,
      isOffline,
      mode: modeMeta.mode,
      startLoading,
      stopLoading,
      withLoading,
    }),
    [initialLoadComplete, isOffline, modeMeta.mode, overlayActive, startLoading, stopLoading, withLoading]
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <Loader
        active={overlayActive}
        mode={modeMeta.mode}
        subtitle={modeMeta.subtitle}
        statusLabel={modeMeta.statusLabel}
        showProgress={modeMeta.showProgress}
        reducedMotion={reducedMotion}
      />
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}

export function useInitialLoadComplete() {
  return useContext(LoadingContext).initialLoadComplete;
}
