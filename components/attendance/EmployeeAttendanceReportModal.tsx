"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmployeeAttendanceReportView, TimeframeMode } from "./EmployeeAttendanceReportView";
import { ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmployeeAttendanceReportModalProps {
  employeeId?: string;
  isOpen: boolean;
  onClose: () => void;
  initialTimeframe?: TimeframeMode;
}

export function EmployeeAttendanceReportModal({
  employeeId,
  isOpen,
  onClose,
  initialTimeframe = "month",
}: EmployeeAttendanceReportModalProps) {
  const [activeEmployeeId, setActiveEmployeeId] = React.useState<string | undefined>(employeeId);

  React.useEffect(() => {
    setActiveEmployeeId(employeeId);
  }, [employeeId]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-6xl w-[96vw] max-h-[92vh] overflow-y-auto p-4 sm:p-6 rounded-3xl border border-border shadow-2xl"
        showCloseButton={false}
      >
        <DialogHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-base font-bold text-foreground">
              Employee Attendance & Compliance Inspector
            </DialogTitle>
          </div>

          <div className="flex items-center gap-2">
            {activeEmployeeId && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="h-8 gap-1.5 text-xs font-semibold rounded-lg"
              >
                <a
                  href={`/attendance/report?employeeId=${activeEmployeeId}&timeframe=${initialTimeframe}`}
                  target="_blank"
                  rel="noreferrer"
                  title="Open report in dedicated full page"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Full Page View
                </a>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-lg hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="pt-2">
          <EmployeeAttendanceReportView
            initialEmployeeId={activeEmployeeId}
            onEmployeeChange={(newId) => setActiveEmployeeId(newId)}
            initialTimeframe={initialTimeframe}
            showNavigationBack={false}
            isModal={true}
            onCloseModal={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
