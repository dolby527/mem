"use client";

import { useEffect, useRef } from "react";
import { getApiBaseUrl, getHospitalSlug } from "@/lib/api/config";
import { SSE_RETRY_MS } from "./constants";
import { parseSseFrame } from "./sse-fetch";
import type { StatusUpdateEvent } from "./types";

export function useMonitoringStream(
  onUpdate: (event: StatusUpdateEvent) => void,
  onOpen?: () => void,
  onClose?: () => void,
) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const slug = getHospitalSlug();
    const query = slug
      ? `?hospitalSlug=${encodeURIComponent(slug)}`
      : "";
    const url = `${getApiBaseUrl()}/monitoring/stream${query}`;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let closed = false;
    let abort: AbortController | null = null;

    async function connect() {
      abort = new AbortController();
      const headers: HeadersInit = { Accept: "text/event-stream" };
      if (slug) {
        headers["x-hospital-slug"] = slug;
      }

      try {
        const response = await fetch(url, {
          credentials: "include",
          cache: "no-store",
          signal: abort.signal,
          headers,
        });

        if (!response.ok || !response.body) {
          throw new Error(`SSE HTTP ${response.status}`);
        }

        onOpenRef.current?.();

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!closed && !abort.signal.aborted) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          let splitAt = buffer.indexOf("\n\n");
          while (splitAt !== -1) {
            const frame = buffer.slice(0, splitAt);
            buffer = buffer.slice(splitAt + 2);
            const parsed = parseSseFrame(frame);
            if (parsed?.event === "statusUpdate" && parsed.data) {
              try {
                const data = JSON.parse(parsed.data) as StatusUpdateEvent;
                onUpdateRef.current(data);
              } catch {
                /* ignore malformed payloads */
              }
            }
            splitAt = buffer.indexOf("\n\n");
          }
        }
      } catch (error) {
        if (abort.signal.aborted || closed) return;
        void error;
      } finally {
        onCloseRef.current?.();
        abort = null;
        if (!closed) {
          retryTimer = setTimeout(() => {
            void connect();
          }, SSE_RETRY_MS);
        }
      }
    }

    void connect();

    return () => {
      closed = true;
      if (retryTimer) clearTimeout(retryTimer);
      abort?.abort();
      onCloseRef.current?.();
    };
  }, []);
}
