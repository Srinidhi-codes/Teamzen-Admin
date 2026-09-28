"use client";

import { useEffect, useCallback, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useStore } from "@/lib/store/useStore";
import { useGraphQLUpdateUser } from "@/lib/api/graphqlHooks";

export function useOnboardingTour() {
    const { user, setSidebarCollapsed, setSidebarMobileOpen } = useStore();
    const { updateUserAsync } = useGraphQLUpdateUser();
    const hasSentUpdateRef = useRef(false);

    const startTour = useCallback(() => {
        // Only force open the sidebar on mobile devices
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
            setSidebarMobileOpen(true);
        }
        // Note: We no longer force setSidebarCollapsed(false) for desktop, 
        // ensuring the tour respects the user's preferred layout on wider screens.

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
                    element: '#nav-payroll',
                    popover: {
                        title: 'Payroll',
                        description: 'Run monthly payroll, advances, publish payslips, and payouts. Open Payroll and use “Take payroll tour” for a guided walkthrough.',
                        side: "right",
                        align: 'start'
                    }
                },
                {
                    element: '#nav-onboarding',
                    popover: {
                        title: 'Employee Onboarding',
                        description: 'Start hires, verify documents, and track preboarding → day-90 checklists. Open Onboarding and use “Take onboarding tour”.',
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

        // Small delay to allow sidebar to expand/open before highlighting
        setTimeout(() => {
            driverObj.drive();
        }, 500);
    }, [setSidebarCollapsed, setSidebarMobileOpen]);

    useEffect(() => {
        // Only trigger if user exists, hasn't seen onboarding, and we haven't already sent an update this session
        if (user && user.hasSeenOnboarding === false && !hasSentUpdateRef.current) {
            const timer = setTimeout(() => {
                hasSentUpdateRef.current = true;
                
                // 1. Persist to DB immediately
                updateUserAsync({ has_seen_onboarding: true }).catch(console.error);

                // 2. Start tour with a delay to ensure sidebar transition is handled
                setTimeout(() => {
                    startTour();
                }, 1000);
            }, 3000); // 3s delay on initial mount
            return () => clearTimeout(timer);
        }
    }, [user, startTour, updateUserAsync]);

    return { startTour };
}

export function OnboardingTour() {
    useOnboardingTour();
    return null;
}
