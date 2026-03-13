"use client";

import useWebSocket, { ReadyState } from "react-use-websocket";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";

export function useNotifications(
    onMessageReceived?: (msg: any) => void,
    options: { silent?: boolean } = { silent: false }
) {
    const [socketUrl, setSocketUrl] = useState<string | null>(null);
    const callbackRef = useRef(onMessageReceived);

    useEffect(() => {
        callbackRef.current = onMessageReceived;
    }, [onMessageReceived]);

    useEffect(() => {
        const fetchTokenAndConnect = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            let protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
            let host = window.location.host;

            if (apiUrl) {
                const urlObj = new URL(apiUrl);
                protocol = urlObj.protocol === "https:" ? "wss:" : "ws:";
                host = urlObj.host;
            } else {
                if (window.location.port === "3000" || window.location.port === "3001") {
                    host = `${window.location.hostname}:8000`;
                } else {
                    host = window.location.host;
                }
            }

            let token = "";
            try {
                const res = await fetch('/api/auth/ws-token');
                if (res.ok) {
                    const data = await res.json();
                    token = data.token;
                }
            } catch (e) {
                console.error("Failed to fetch Admin WebSocket token:", e);
            }

            const url = `${protocol}//${host}/ws/notifications/${token ? `?token=${token}` : ''}`;
            console.log("Setting Admin Notification Socket connection to:", url);
            setSocketUrl(url);
        };

        fetchTokenAndConnect();
    }, []);

    const { readyState } = useWebSocket(socketUrl, {
        shouldReconnect: () => true,
        reconnectInterval: 5000,
        share: true,
        onOpen: () => console.log("Admin Notification Socket Connected ✅"),
        onClose: () => console.log("Admin Notification Socket Disconnected ❌"),
        onError: (err) => {
            console?.error("Admin Notification Socket Error ⚠️:", err);
            if (err instanceof Error) {
                console.error("Error Message:", err.message);
            }
        },
        onMessage: (event) => {
            const data = JSON.parse(event.data);
            // Process both personal and admin notifications
            if (data.level === 'admin' || data.level === 'personal') {
                if (!options.silent) {
                    const displayVerb = data.verb?.replace(/_self$/, "").replace(/_/g, " ");
                    const description = data.verb?.endsWith('_self') ? "Action confirmed" : `${data.actor?.firstName} ${displayVerb}`;

                    // Color coding based on verb
                    if (data.verb?.includes('rejected')) {
                        toast.error(data.message, { description, duration: 6000 });
                    } else if (data.verb?.includes('approved')) {
                        toast.success(data.message, { description, duration: 6000 });
                    } else if (data.verb?.includes('cancelled')) {
                        toast(data.message, {
                            description,
                            duration: 6000,
                            className: "bg-blue-500 text-white border-none shadow-blue-500/50",
                        });
                    } else {
                        toast.success(data.message, { description, duration: 5000 });
                    }
                }

                if (callbackRef.current) {
                    callbackRef.current(data);
                }
            }
        }
    }, socketUrl !== null);

    return { readyState, isConnected: readyState === ReadyState.OPEN };
}
