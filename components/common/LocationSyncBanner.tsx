"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { UPDATE_LOGIN_LOCATION } from "@/lib/graphql/users/mutations";
import { GET_MY_LOGIN_HISTORY } from "@/lib/graphql/users/queries";
import { SecurityLogResponse } from "@/lib/graphql/users/types";
import { Globe, ShieldAlert, Sparkles, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function LocationSyncBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [updateLocation] = useMutation(UPDATE_LOGIN_LOCATION);

    // Check if the latest login has coordinates
    const { data, refetch } = useQuery<SecurityLogResponse>(GET_MY_LOGIN_HISTORY, {
        variables: { page: 1, pageSize: 1 },
        fetchPolicy: "network-only"
    });

    useEffect(() => {
        // Check if permission is already denied
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'geolocation' }).then(result => {
                if (result.state === 'denied') {
                    setIsBlocked(true);
                }
                result.onchange = () => {
                    if (result.state === 'denied') setIsBlocked(true);
                    else if (result.state === 'granted') {
                        setIsBlocked(false);
                        handleSync(); // Auto-sync if they grant it via lock icon
                    }
                };
            });
        }

        const latestLog = data?.mySecurityLogs?.results?.[0];
        // If there's a log but no latitude, show the banner
        if (latestLog && !latestLog.latitude) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [data]);

    const handleSync = async () => {
        setIsSyncing(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    await updateLocation({
                        variables: {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        }
                    });
                    setIsVisible(false);
                    refetch();
                } catch (err) {
                    console.error("Failed to update location:", err);
                } finally {
                    setIsSyncing(false);
                }
            },
            (err) => {
                console.error("Geolocation error:", err);
                if (err.code === 1) setIsBlocked(true);
                setIsSyncing(false);
            },
            { enableHighAccuracy: true }
        );
    };

    if (!isVisible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] animate-in slide-in-from-top duration-500">
            <div className="bg-linear-to-r from-rose-600 via-rose-500 to-orange-500 text-white shadow-2xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-2 sm:py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex w-8 h-8 bg-white/20 rounded-lg items-center justify-center backdrop-blur-md">
                            <ShieldAlert className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-white/95">
                                {isBlocked ? "Location blocked" : "Location verification needed"}
                            </p>
                            <p className="text-[11px] font-medium text-white/80 leading-snug">
                                {isBlocked 
                                    ? "Allow location for this site in your browser settings, then try again."
                                    : "Sync your location to verify this login session."
                                }
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className={cn(
                                "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors",
                                "bg-white text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                            )}
                        >
                            {isSyncing ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <Globe className="w-3 h-3" />
                            )}
                            {isSyncing ? "Syncing…" : isBlocked ? "Retry" : "Sync location"}
                        </button>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="p-1 hover:bg-white/10 rounded-md transition-colors"
                        >
                            <X className="w-4 h-4 text-white/60" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Ambient Glow */}
            <div className="h-[2px] bg-white/30 w-full animate-pulse" />
        </div>
    );
}
