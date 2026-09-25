"use client";

import { useCallback } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

type TourVariant = "board" | "detail";

function existingSteps(
  steps: Array<{ element: string; popover: Record<string, unknown> }>
) {
  return steps.filter(
    (s) => typeof document !== "undefined" && document.querySelector(s.element)
  );
}

export function startOffboardingTour(variant: TourVariant = "board") {
  const boardSteps = [
    {
      element: "#offboarding-kpis",
      popover: {
        title: "Exit & F&F overview",
        description:
          "Track employee offboarding pipelines across all phases: Initiated, In progress, Settlement pending, Letters pending, and Completed.",
        side: "bottom" as const,
      },
    },
    {
      element: "#offboarding-letters-link",
      popover: {
        title: "Letter templates",
        description:
          "Manage relieving and experience letter templates, customize merge tags, and preview documents.",
        side: "bottom" as const,
      },
    },
    {
      element: "#offboarding-filters",
      popover: {
        title: "Search & filter",
        description:
          "Quickly find departing employees by name or email, and filter by offboarding status.",
        side: "bottom" as const,
      },
    },
    {
      element: "#offboarding-table",
      popover: {
        title: "Offboarding pipeline",
        description:
          "Review clearance progress %, Exit Date, and Last Working Day (LWD). Click Open to handle clearance tasks, calculate F&F, and issue letters.",
        side: "top" as const,
      },
    },
  ];

  const detailSteps = [
    {
      element: "#offboarding-detail-header",
      popover: {
        title: "Offboarding profile",
        description:
          "View the employee's current exit status, contact details, and overall offboarding progress.",
        side: "bottom" as const,
      },
    },
    {
      element: "#offboarding-detail-actions",
      popover: {
        title: "Quick actions",
        description:
          "Resend the exit survey / clearance portal link, or cancel offboarding if the employee withdrew resignation.",
        side: "bottom" as const,
      },
    },
    {
      element: "#offboarding-tasks",
      popover: {
        title: "Clearance checklist",
        description:
          "Track handover tasks across departments (IT, HR, Finance, Manager). Mark items complete as assets and accesses are returned.",
        side: "top" as const,
      },
    },
    {
      element: "#offboarding-fnf",
      popover: {
        title: "Full & Final (F&F) settlement",
        description:
          "Calculate pro-rata salary, leave encashment, bonus/gratuity, recoveries, and other deductions. Compute, approve, and record payment.",
        side: "top" as const,
      },
    },
    {
      element: "#offboarding-letters",
      popover: {
        title: "Experience & Relieving letters",
        description:
          "Choose letter templates, preview generated PDF documents, and issue official exit documents directly to the employee.",
        side: "top" as const,
      },
    },
  ];

  const map = {
    board: boardSteps,
    detail: detailSteps,
  };

  const steps = existingSteps(map[variant]);
  if (!steps.length) return;

  const driverObj = driver({
    showProgress: true,
    animate: true,
    popoverClass: "driverjs-theme",
    steps,
  });
  driverObj.drive();
}

export function useOffboardingTour() {
  return {
    startBoardTour: useCallback(() => startOffboardingTour("board"), []),
    startDetailTour: useCallback(() => startOffboardingTour("detail"), []),
  };
}

export function OffboardingTourButton({
  variant = "board",
}: {
  variant?: TourVariant;
}) {
  const labels: Record<TourVariant, string> = {
    board: "Take offboarding tour",
    detail: "Tour this offboarding",
  };
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      id="offboarding-tour-trigger"
      onClick={() => startOffboardingTour(variant)}
      className="gap-1.5 h-9"
    >
      <HelpCircle className="h-4 w-4" />
      {labels[variant]}
    </Button>
  );
}
