"use client";

import { useCallback } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

export function startPayrollTour(variant: "list" | "detail" = "list") {
  const listSteps = [
    {
      element: "#payroll-setup-checklist",
      popover: {
        title: "Setup checklist",
        description:
          "Complete components, salary structures, and assign CTC to employees before creating a run.",
        side: "bottom" as const,
      },
    },
    {
      element: "#payroll-tab-runs",
      popover: {
        title: "Monthly runs",
        description:
          "Each month gets one payroll run. Create a draft, process calculations, then open it to publish and pay.",
        side: "bottom" as const,
      },
    },
    {
      element: "#payroll-tab-advances",
      popover: {
        title: "Salary advances",
        description:
          "Grant advances here. Installments are auto-deducted as ADV lines when you process payroll.",
        side: "bottom" as const,
      },
    },
    {
      element: "#payroll-create-run",
      popover: {
        title: "Create monthly run",
        description:
          "Creates a draft for the month. You will process (calculate) payslips on the run detail page.",
        side: "left" as const,
      },
    },
    {
      element: "#payroll-settings-auto",
      popover: {
        title: "Auto-run settings",
        description:
          "Pro/Elite plans can enable monthly auto-calculation on a cycle day. You still publish and payout manually.",
        side: "top" as const,
      },
    },
  ];

  const detailSteps = [
    {
      element: "#payroll-run-stepper",
      popover: {
        title: "Payroll steps",
        description:
          "Follow Draft → Process → Review → Publish → Payout. Locked (published/paid) slips cannot be recalculated.",
        side: "bottom" as const,
      },
    },
    {
      element: "#payroll-process",
      popover: {
        title: "Process / recalculate",
        description:
          "Builds payslips from CTC, LOP, adjustments, and advance recoveries.",
        side: "bottom" as const,
      },
    },
    {
      element: "#payroll-publish",
      popover: {
        title: "Publish",
        description:
          "Generates PDFs and makes slips visible to employees. Do this after you are happy with the numbers.",
        side: "bottom" as const,
      },
    },
    {
      element: "#payroll-payout",
      popover: {
        title: "Payout",
        description:
          "Pays published slips via Razorpay (or mock). Employees need bank details on file.",
        side: "bottom" as const,
      },
    },
  ];

  const steps = (variant === "detail" ? detailSteps : listSteps).filter(
    (s) => typeof document !== "undefined" && document.querySelector(s.element)
  );

  if (!steps.length) return;

  const driverObj = driver({
    showProgress: true,
    animate: true,
    popoverClass: "driverjs-theme",
    steps,
  });
  driverObj.drive();
}

export function usePayrollTour() {
  const startListTour = useCallback(() => startPayrollTour("list"), []);
  const startDetailTour = useCallback(() => startPayrollTour("detail"), []);
  return { startListTour, startDetailTour };
}

export function PayrollTourButton({
  variant = "list",
}: {
  variant?: "list" | "detail";
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      id="payroll-tour-trigger"
      onClick={() => startPayrollTour(variant)}
      className="gap-1.5"
    >
      <HelpCircle className="h-4 w-4" />
      Take payroll tour
    </Button>
  );
}
