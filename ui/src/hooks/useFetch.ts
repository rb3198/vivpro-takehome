import { useCallback, useState } from "react";

export const useFetch = <T>(
  onSuccess?: (res: T) => unknown,
  onFailure?: (err: unknown) => unknown
) => {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>();

  /**
   * A method which does NOT update the data on request completion.
   * @returns the raw response.
   */
  const fetchResult = useCallback(
    async (
      url: string,
      method: "get" | "patch" | "put" | "post" | "delete",
      body?: BodyInit
    ) => {
      setLoading(true);
      const headers: [string, string][] = [];
      method !== "get" && headers.push(["Content-Type", "application/json"]);
      return fetch(url, {
        method: method.toUpperCase(),
        body,
        headers,
        credentials: "include",
      }).finally(() => setLoading(false));
    },
    []
  );

  const fetchResource = useCallback(
    async (
      url: string,
      method: "get" | "patch" | "put" | "post" | "delete",
      body?: BodyInit
    ) => {
      setLoading(true);
      const headers: [string, string][] = [];
      method !== "get" && headers.push(["Content-Type", "application/json"]);
      try {
        const res = await fetch(url, {
          method: method.toUpperCase(),
          body,
          headers,
          credentials: "include",
        });
        let data = undefined;
        if (res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            // Return JSON if content type is JSON
            data = await res.json();
          } else if (res.body) {
            // Return body text if there's a body but not JSON
            data = await res.text();
          } else {
            // Return true for successful responses with no body
            data = true;
          }
          setData(data);
          setError(null);
          onSuccess && onSuccess(data as T);
        } else if (!res.redirected) {
          setError(res.statusText);
          onFailure && onFailure(res.statusText);
        }
      } catch (error) {
        setError(error);
        onFailure && onFailure(error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { fetch: fetchResource, fetchResult, loading, data, error };
};
