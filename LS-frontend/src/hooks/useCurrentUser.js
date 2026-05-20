import { useEffect, useState } from "react";
import { getCurrentUser, hasAuthToken, loadCurrentUser, onProfileUpdated } from "../services/userProfileStore";

export function useCurrentUser({ autoLoad = true } = {}) {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [loading, setLoading] = useState(() => Boolean(autoLoad && !currentUser && hasAuthToken()));

  useEffect(() => {
    const syncUser = () => {
      setCurrentUser(getCurrentUser());
    };

    syncUser();
    return onProfileUpdated(syncUser);
  }, []);

  useEffect(() => {
    if (!autoLoad) return;
    if (getCurrentUser()) {
      setLoading(false);
      return;
    }
    if (!hasAuthToken()) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    loadCurrentUser()
      .catch(() => null)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [autoLoad]);

  return { currentUser, loading };
}
