import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";

/**
 * Keeps time-based study views current while they are open and refreshes as
 * soon as the app returns from the background.
 */
export function useStudyClock(intervalMs = 60_000) {
  const [now, setNow] = useState(() => Date.now());
  const refresh = useCallback(() => setNow(Date.now()), []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    const timer = setInterval(refresh, intervalMs);
    return () => {
      subscription.remove();
      clearInterval(timer);
    };
  }, [intervalMs, refresh]);

  return { now, refresh };
}
