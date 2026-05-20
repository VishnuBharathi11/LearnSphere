let activeRequests = 0;
const listeners = new Set();

function notify() {
  listeners.forEach((listener) => {
    try {
      listener(activeRequests);
    } catch {
      // no-op
    }
  });
}

export function incrementNetworkActivity() {
  activeRequests += 1;
  notify();
}

export function decrementNetworkActivity() {
  activeRequests = Math.max(0, activeRequests - 1);
  notify();
}

export function getNetworkActivityCount() {
  return activeRequests;
}

export function subscribeNetworkActivity(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

