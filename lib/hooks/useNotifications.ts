"use client";

import useWebSocket, { ReadyState } from "react-use-websocket";
import { toast } from "sonner";
import { useEffect, useRef, useState, useCallback } from "react";

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
  const [shouldConnect, setShouldConnect] = useState(false);
  const callbackRef = useRef(onMessageReceived);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    callbackRef.current = onMessageReceived;
  }, [onMessageReceived]);

  const initConnection = useCallback(async (forceRefresh = false) => {
    try {
      const url = forceRefresh ? "/api/auth/ws-token?refresh=1" : "/api/auth/ws-token";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        setSocketUrl(null);
        setShouldConnect(false);
        return;
      }

      const data = await res.json();
      const token = data?.token;
      if (!token) {
        setSocketUrl(null);
        setShouldConnect(false);
        return;
      }

      const { protocol, host } = buildWsHost();
      setSocketUrl(
        `${protocol}//${host}/ws/notifications/?token=${encodeURIComponent(token)}`
      );
      setShouldConnect(true);
    } catch {
      setSocketUrl(null);
      setShouldConnect(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    initConnection();

    return () => {
      mounted = false;
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [initConnection]);

  const { readyState } = useWebSocket(
    socketUrl,
    {
      shouldReconnect: (closeEvent) => {
        // Never blindly reconnect if rejected with authentication error
        if (
          closeEvent?.code === 4401 ||
          closeEvent?.code === 4001 ||
          closeEvent?.code === 1008
        ) {
          return false;
        }
        return shouldConnect;
      },
      reconnectAttempts: 10,
      reconnectInterval: (attempt) => Math.min(2000 * 1.5 ** attempt, 20000),
      share: true,
      onOpen: () => {
        if (refreshTimerRef.current) {
          clearTimeout(refreshTimerRef.current);
          refreshTimerRef.current = null;
        }
      },
      onClose: (event) => {
        // Stop retrying immediately upon 4401/4001 and attempt one quiet token refresh
        if (event.code === 4401 || event.code === 4001) {
          setShouldConnect(false);
          setSocketUrl(null);

          if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
          }
          refreshTimerRef.current = setTimeout(() => {
            initConnection(true);
          }, 3000);
        }
      },
      onError: () => {
        // Suppress noisy generic WebSocket error events
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

        if (typeof window !== "undefined" && data.verb === "announcement") {
          window.dispatchEvent(new CustomEvent("teamzen_announcement", { detail: data }));
        }

        callbackRef.current?.(data);
      },
    },
    shouldConnect && socketUrl !== null
  );

  return { readyState, isConnected: readyState === ReadyState.OPEN };
}
