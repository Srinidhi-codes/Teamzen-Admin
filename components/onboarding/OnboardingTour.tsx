"use client";

import { useCallback } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

type TourVariant = "board" | "detail" | "templates" | "letters";

function existingSteps(
  steps: Array<{ element: string; popover: Record<string, unknown> }>
) {
  return steps.filter(
    (s) => typeof document !== "undefined" && document.querySelector(s.element)
  );
}

export function startHrOnboardingTour(variant: TourVariant = "board") {
  const boardSteps = [
    {
      element: "#onboarding-kpis",
      popover: {
        title: "Onboarding overview",
        description:
          "Track how many hires are in preboarding, in progress, and overdue documents at a glance.",
        side: "bottom" as const,
      },
    },
    {
      element: "#onboarding-start-hire",
      popover: {
        title: "Start hire",
        description:
          "Create a pending employee, generate an offer, and email a magic-link preboarding portal.",
        side: "left" as const,
      },
    },
    {
      element: "#onboarding-board-table",
      popover: {
        title: "Progress board",
        description:
          "Filter by status and open any hire to verify KYC docs, complete tasks, and activate the account.",
        side: "top" as const,
      },
    },
    {
      element: "#onboarding-nav-templates",
      popover: {
        title: "Templates",
        description:
          "Customize Standard Onboarding checklists. Drag tasks to reorder, then save. Use AI Copilot for role-specific lists.",
        side: "bottom" as const,
      },
    },
    {
      element: "#ai-assistant-trigger",
      popover: {
        title: "AI onboarding buddy",
        description:
          "Ask the assistant for checklist ideas, policy answers, or what’s blocking a hire’s onboarding.",
        side: "left" as const,
      },
    },
  ];

  const detailSteps = [
    {
      element: "#onboarding-detail-actions",
      popover: {
        title: "Hire actions",
        description:
          "Resend invite, regenerate offer, activate the employee after docs are verified, or cancel.",
        side: "bottom" as const,
      },
    },
    {
      element: "#onboarding-detail-docs",
      popover: {
        title: "Document verification",
        description:
          "Approve or reject KYC uploads. Rejection emails the candidate with a reason to re-upload.",
        side: "top" as const,
      },
    },
    {
      element: "#onboarding-detail-tasks",
      popover: {
        title: "Checklist tasks",
        description:
          "Mark HR/IT/manager tasks complete. Progress updates automatically.",
        side: "top" as const,
      },
    },
  ];

  const templatesSteps = [
    {
      element: "#onboarding-template-list",
      popover: {
        title: "Templates",
        description: "Select Standard Onboarding or create role-specific templates.",
        side: "right" as const,
      },
    },
    {
      element: "#onboarding-task-list",
      popover: {
        title: "Drag to reorder",
        description:
          "Rearrange tasks locally, then click Save order. New hires inherit this sequence.",
        side: "left" as const,
      },
    },
    {
      element: "#onboarding-ai-copilot",
      popover: {
        title: "AI Copilot",
        description:
          "Describe a role (e.g. remote engineering intern) and generate a suggested checklist you can apply.",
        side: "top" as const,
      },
    },
  ];

  const lettersSteps = [
    {
      element: "#onboarding-letter-editor",
      popover: {
        title: "Offer templates",
        description:
          "Edit the subject and HTML body. Tokens like employee_name and join_date are filled per hire. Use AI Polish for tone.",
        side: "left" as const,
      },
    },
    {
      element: "#onboarding-letter-polish",
      popover: {
        title: "AI Polish",
        description:
          "Rewrites the offer body while keeping merge fields intact. Review before saving.",
        side: "bottom" as const,
      },
    },
  ];

  const map = {
    board: boardSteps,
    detail: detailSteps,
    templates: templatesSteps,
    letters: lettersSteps,
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

export function useHrOnboardingTour() {
  return {
    startBoardTour: useCallback(() => startHrOnboardingTour("board"), []),
    startDetailTour: useCallback(() => startHrOnboardingTour("detail"), []),
    startTemplatesTour: useCallback(() => startHrOnboardingTour("templates"), []),
    startLettersTour: useCallback(() => startHrOnboardingTour("letters"), []),
  };
}

export function HrOnboardingTourButton({
  variant = "board",
}: {
  variant?: TourVariant;
}) {
  const labels: Record<TourVariant, string> = {
    board: "Take onboarding tour",
    detail: "Tour this hire",
    templates: "Tour templates",
    letters: "Tour offer letters",
  };
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      id="onboarding-tour-trigger"
      onClick={() => startHrOnboardingTour(variant)}
      className="gap-1.5"
    >
      <HelpCircle className="h-4 w-4" />
      {labels[variant]}
    </Button>
  );
}
