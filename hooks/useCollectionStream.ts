"use client";

import { useEffect, useState } from "react";

interface StreamOptions {
  fallbackUrl?: string;
}

export function useCollectionStream<T>(
  url: string,
  eventName: string,
  options: StreamOptions = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fallbackUrl = options.fallbackUrl ?? url.replace(/\/stream(?:\?.*)?$/, "");

  useEffect(() => {
    let active = true;
    let pollId: ReturnType<typeof setInterval> | null = null;
    let source: EventSource | null = null;

    const fetchFallback = async () => {
      if (!active || !fallbackUrl || fallbackUrl === url) return false;
      try {
        const res = await fetch(fallbackUrl, { cache: "no-store", credentials: "same-origin" });
        if (!res.ok) return false;
        const json = (await res.json()) as T[];
        if (!active) return true;
        setData(Array.isArray(json) ? json : []);
        setLoading(false);
        setError("");
        return true;
      } catch {
        return false;
      }
    };

    const startPolling = async (message: string) => {
      const ok = await fetchFallback();
      if (!active) return;
      if (ok) {
        setError(message);
        if (!pollId) pollId = setInterval(() => { void fetchFallback(); }, 15000);
      } else {
        setError("Live updates unavailable. Check server configuration.");
        setLoading(false);
      }
    };

    try {
      source = new EventSource(url);
    } catch {
      void startPolling("Live updates unavailable. Showing latest data.");
      return () => { active = false; if (pollId) clearInterval(pollId); };
    }

    const onData = (event: MessageEvent<string>) => {
      if (!active) return;
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
      if (!active) return;
      source?.close();
      source = null;
      void startPolling("Live updates disconnected. Showing latest data.");
    };

    source.addEventListener(eventName, onData as EventListener);
    source.addEventListener("error", onError as EventListener);

    return () => {
      active = false;
      if (pollId) clearInterval(pollId);
      if (source) {
        source.removeEventListener(eventName, onData as EventListener);
        source.removeEventListener("error", onError as EventListener);
        source.close();
      }
    };
  }, [url, eventName, fallbackUrl]);

  return { data, loading, error };
}
