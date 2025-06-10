import { useCallback, useState } from "react";

export const useFetch = <T>() => {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>();

  const fetchResource = useCallback(
    async (url: string, method: "get" | "patch" | "put", body?: BodyInit) => {
      setLoading(true);
      try {
        const res = await fetch(url, {
          method: method.toUpperCase(),
          body,
          headers:
            method === "patch"
              ? [["Content-Type", "application/json"]]
              : undefined,
        });
        setData(await res.json());
        setError(null);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { fetch: fetchResource, loading, data, error };
};
