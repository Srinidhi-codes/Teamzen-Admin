"use client";

import useWebSocket, { ReadyState } from "react-use-websocket";
import { toast } from "sonner";
import { useEffect, useCallback } from "react";

export function useNotifications(onMessageReceived?: (msg: any) => void) {
    const getSocketUrl = useCallback(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        let protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        let host = window.location.host;

        if (apiUrl) {
            const urlObj = new URL(apiUrl);
            protocol = urlObj.protocol === "https:" ? "wss:" : "ws:";
            host = urlObj.host;
        } else if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
            host = "localhost:8000";
        }

        const url = `${protocol}//${host}/ws/notifications/`;
        console.log("Attempting Admin Notification Socket connection to:", url);
        return url;
    }, []);

    const { readyState } = useWebSocket(getSocketUrl, {
        shouldReconnect: () => true,
        reconnectInterval: 5000,
        onOpen: () => console.log("Admin Notification Socket Connected ✅"),
        onClose: () => console.log("Admin Notification Socket Disconnected ❌"),
        onError: (err) => {
            console.error("Admin Notification Socket Error ⚠️:", err);
            if (err instanceof Error) {
                console.error("Error Message:", err.message);
            }
        },
        onMessage: (event) => {
            const data = JSON.parse(event.data);
            toast.success(data.message, {
                description: `Alert: ${data.verb}`,
                duration: 5000,
            });
            if (onMessageReceived) {
                onMessageReceived(data);
            }
        }
    });

    return { readyState, isConnected: readyState === ReadyState.OPEN };
}
