import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
// Loads data from the API when the component mounts.
// Pass { interval: 5000 } to refresh it every 5 seconds.
//
//   const { data, loading, error, reload } = useFetch("/shipments");
export function useFetch(path, { interval } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!path) return;
    try {
      setData(await api(path));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    setLoading(true);
    load();

    if (!interval) return;
    const timer = setInterval(load, interval);
    return () => clearInterval(timer);
  }, [load, interval]);

  return { data, error, loading, reload: load };
}
