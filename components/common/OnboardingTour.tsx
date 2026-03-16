"use client";

import { useEffect, useCallback } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useStore } from "@/lib/store/useStore";

export function useOnboardingTour() {
    const { user, setSidebarCollapsed, setSidebarMobileOpen } = useStore();

    const startTour = useCallback(() => {
        // Ensure sidebar is visible for the tour
        setSidebarCollapsed(false);
        setSidebarMobileOpen(true);

        const driverObj = driver({
            showProgress: true,
            animate: true,
            popoverClass: 'driverjs-theme',
            steps: [
                {
                    element: '#nav-dashboard',
                    popover: {
                        title: 'Admin Control Center',
                        description: 'Monitor your entire organization from here. View employee growth, department distributions, and real-time activity.',
                        side: "right",
                        align: 'start'
                    }
                },
                {
                    element: '#nav-employees',
                    popover: {
                        title: 'Workforce Management',
                        description: 'Manage your staff, add new employees, and oversee departmental assignments.',
                        side: "right",
                        align: 'start'
                    }
                },
                {
                    element: '#nav-attendance',
                    popover: {
                        title: 'Attendance Oversight',
                        description: 'Track daily attendance, manage corrections, and ensure operational compliance.',
                        side: "right",
                        align: 'start'
                    }
                },
                {
                    element: '#nav-leaves',
                    popover: {
                        title: 'Leave Approval Logic',
                        description: 'Review and approve leave requests. Keep track of team availability at a glance.',
                        side: "right",
                        align: 'start'
                    }
                },
                {
                    element: '#ai-assistant-trigger',
                    popover: {
                        title: 'Administrative AI',
                        description: 'Our AI assistant can help you with complex queries, system data, and administrative actions.',
                        side: "left",
                        align: 'start'
                    }
                },
                {
                    element: '#user-menu-trigger',
                    popover: {
                        title: 'System Access',
                        description: 'Switch to the User Portal, configure system settings, or re-run this tour anytime.',
                        side: "bottom",
                        align: 'end'
                    }
                },
            ]
        });

        driverObj.drive();
    }, []);

    useEffect(() => {
        if (user) {
            const hasSeenTour = localStorage.getItem(`has_seen_admin_tour_${user.id}`);
            if (!hasSeenTour) {
                const timer = setTimeout(() => {
                    startTour();
                    localStorage.setItem(`has_seen_admin_tour_${user.id}`, 'true');
                }, 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [user, startTour]);

    return { startTour };
}

export function OnboardingTour() {
    useOnboardingTour();
    return null;
}
