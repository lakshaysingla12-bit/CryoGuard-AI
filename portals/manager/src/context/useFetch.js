import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";

// Loads data from the API. Pass a list of "refreshOn" values and the data is
// loaded again whenever one of them changes (for example the live tick).
export default function useFetch(path, refreshOn = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    return api(path)
      .then((result) => {
        setData(result);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, ...refreshOn]);

  return { data, error, loading, reload: load };
}
