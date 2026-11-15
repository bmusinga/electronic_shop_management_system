"use client";

import { useEffect, useState } from "react";

export function useCollectionStream<T>(url: string, eventName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const source = new EventSource(url);

    const onData = (event: MessageEvent<string>) => {
      if (!active) {
        return;
      }
      try {
        setData(JSON.parse(event.data) as T[]);
        setLoading(false);
        setError("");
      } catch {
        setError("Could not read live updates.");
        setLoading(false);
      }
    };

    const onError = () => {
      if (!active) {
        return;
      }
      setError("Live updates disconnected. Reconnecting...");
      setLoading(false);
    };

    source.addEventListener(eventName, onData as EventListener);
    source.addEventListener("error", onError as EventListener);

    return () => {
      active = false;
      source.removeEventListener(eventName, onData as EventListener);
      source.removeEventListener("error", onError as EventListener);
      source.close();
    };
  }, [url, eventName]);

  return { data, loading, error };
}
