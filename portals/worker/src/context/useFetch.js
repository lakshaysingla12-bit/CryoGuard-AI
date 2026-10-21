import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client.js";

export default function useFetch(path, dependencies = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);

    try {
      const result = await api(path);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
      console.error("Failed to fetch:", path, err);
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    reload();
  }, [reload, ...dependencies]);

  return { data, loading, error, reload };
}