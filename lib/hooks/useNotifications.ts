"use client";

import useWebSocket, { ReadyState } from "react-use-websocket";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";

function buildWsHost(): { protocol: string; host: string } {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    try {
      const urlObj = new URL(apiUrl);
      return {
        protocol: urlObj.protocol === "https:" ? "wss:" : "ws:",
        host: urlObj.host,
      };
    } catch {
      // fall through
    }
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname, port, host } = window.location;
    const wsProtocol = protocol === "https:" ? "wss:" : "ws:";
    // Next.js admin runs on 3000/3001; Django ASGI is on 8000 locally
    if (port === "3000" || port === "3001") {
      return { protocol: wsProtocol, host: `${hostname}:8000` };
    }
    return { protocol: wsProtocol, host };
  }

  return { protocol: "ws:", host: "localhost:8000" };
}

export function useNotifications(
  onMessageReceived?: (msg: any) => void,
  options: { silent?: boolean } = { silent: false }
) {
  const [socketUrl, setSocketUrl] = useState<string | null>(null);
  const callbackRef = useRef(onMessageReceived);
  const warnedRef = useRef(false);

  useEffect(() => {
    callbackRef.current = onMessageReceived;
  }, [onMessageReceived]);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const fetchTokenAndConnect = async () => {
      try {
        const res = await fetch("/api/auth/ws-token", { credentials: "include" });
        if (!res.ok) {
          // Not logged in / token not ready — retry quietly, don't open an anonymous socket
          if (!cancelled) {
            retryTimer = setTimeout(fetchTokenAndConnect, 8000);
          }
          return;
        }

        const data = await res.json();
        const token = data?.token;
        if (!token || cancelled) return;

        const { protocol, host } = buildWsHost();
        setSocketUrl(
          `${protocol}//${host}/ws/notifications/?token=${encodeURIComponent(token)}`
        );
      } catch {
        if (!cancelled) {
          retryTimer = setTimeout(fetchTokenAndConnect, 8000);
        }
      }
    };

    fetchTokenAndConnect();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, []);

  const { readyState } = useWebSocket(socketUrl, {
    shouldReconnect: () => true,
    reconnectAttempts: 50,
    reconnectInterval: (attempt) => Math.min(1000 * 2 ** attempt, 15000),
    share: true,
    onOpen: () => {
      warnedRef.current = false;
    },
    onClose: () => {},
    onError: () => {
      // Browser WebSocket error events are empty Event objects (`{}`) — not useful.
      // Log once per disconnect streak so the console isn't spammed.
      if (!warnedRef.current && process.env.NODE_ENV === "development") {
        warnedRef.current = true;
        console.warn(
          "[notifications] WebSocket connection issue — will keep retrying in the background."
        );
      }
    },
    onMessage: (event) => {
      let data: any;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      if (data.level !== "admin" && data.level !== "personal") return;

      if (!options.silent) {
        const displayVerb = data.verb?.replace(/_self$/, "").replace(/_/g, " ");
        const description = data.verb?.endsWith("_self")
          ? "Action confirmed"
          : `${data.actor?.firstName ?? ""} ${displayVerb ?? ""}`.trim();

        if (data.verb?.includes("rejected")) {
          toast.error(data.message, { description, duration: 6000 });
        } else if (data.verb?.includes("approved")) {
          toast.success(data.message, { description, duration: 6000 });
        } else if (data.verb?.includes("cancelled")) {
          toast(data.message, { description, duration: 6000 });
        } else {
          toast.success(data.message, { description, duration: 5000 });
        }
      }

      callbackRef.current?.(data);
    },
  }, socketUrl !== null);

  return { readyState, isConnected: readyState === ReadyState.OPEN };
}
