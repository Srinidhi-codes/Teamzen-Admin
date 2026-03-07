"use client";

import useWebSocket, { ReadyState } from "react-use-websocket";
import { toast } from "sonner";
import { useEffect, useCallback } from "react";

export function useNotifications(onMessageReceived?: (msg: any) => void) {
    const getSocketUrl = useCallback(async () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        let protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        let host = window.location.host;

        if (apiUrl) {
            const urlObj = new URL(apiUrl);
            protocol = urlObj.protocol === "https:" ? "wss:" : "ws:";
            host = urlObj.host;
        } else {
            // Fallback for local development
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
        console.log("Attempting Admin Notification Socket connection to:", url);
        return url;
    }, []);

    const { readyState } = useWebSocket(getSocketUrl, {
        shouldReconnect: () => true,
        reconnectInterval: 5000,
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
                toast.success(data.message, {
                    description: `Alert: ${data.verb}`,
                    duration: 5000,
                });
                if (onMessageReceived) {
                    onMessageReceived(data);
                }
            }
        }
    });

    return { readyState, isConnected: readyState === ReadyState.OPEN };
}
