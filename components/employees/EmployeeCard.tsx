"use client";

import { User } from "@/lib/graphql/users/types";
import { Mail, Phone, Building2, Edit, MapPin, QrCode, ShieldCheck, Briefcase, Download } from "lucide-react";
import { Switch } from "../ui/switch";
import Image from "next/image";
import { useState } from "react";
import { useStore } from "@/lib/store/useStore";
import { cn } from "@/lib/utils";
import { PhotoOverlay } from "@/components/common/PhotoOverlay";
import { Badge } from "@/components/common/Badge";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface EmployeeCardProps {
  employee: User;
  onEdit: (employee: User) => void;
  onStatusToggle: (userId: string, newStatus: boolean) => void;
  onStartOnboarding?: (employee: User) => void | Promise<void>;
  startingOnboardingId?: string | null;
  onStartOffboarding?: (employee: User) => void | Promise<void>;
  startingOffboardingId?: string | null;
}

export default function EmployeeCard({
  employee,
  onEdit,
  onStatusToggle,
  onStartOnboarding,
  startingOnboardingId,
  onStartOffboarding,
  startingOffboardingId,
}: EmployeeCardProps) {
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const { user: currentUser } = useStore();
  const isAdminOrHr =
    currentUser?.role === "admin" ||
    currentUser?.role === "hr" ||
    currentUser?.role === "superadmin";

  const profileUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000"}/p/${employee.id}`;

  const downloadQr = () => {
    const svg = document.getElementById(`qr-code-${employee.id}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new window.Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.width; // square
      // Add white background
      if (ctx) {
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
      }
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${employee.firstName}-${employee.lastName}-QR.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <>
    <div className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden relative shadow-sm hover:shadow-md transition-shadow">
      {/* ID Card Banner Header */}
      <div 
        className="h-24 w-full relative bg-gradient-to-r from-primary/10 to-primary/5"
        style={employee.organization?.accent ? { background: `linear-gradient(135deg, ${employee.organization.accent}20, transparent)` } : undefined}
      >
        <div className="absolute top-3 right-3 flex gap-2">
            <button
                onClick={() => setIsQrOpen(true)}
                className="rounded-full bg-background/50 p-1.5 backdrop-blur-md hover:bg-background/80 transition-colors shadow-sm"
                title="View QR Code"
            >
                <QrCode className="h-4 w-4 text-foreground" />
            </button>
            <span
                className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center justify-center",
                employee.isActive
                    ? "bg-emerald-500 text-white dark:bg-emerald-600"
                    : "bg-destructive text-white"
                )}
            >
                {employee.isActive ? "Active" : "Inactive"}
            </span>
        </div>
      </div>

      {/* Profile Photo & ID Number */}
      <div className="px-5 relative flex justify-between items-end -mt-12 mb-3">
        <button
          type="button"
          onClick={() => employee.profilePictureUrl && setIsPhotoOpen(true)}
          className={cn(
            "relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-card bg-muted shadow-sm",
            employee.profilePictureUrl ? "cursor-zoom-in" : "cursor-default"
          )}
          title={employee.profilePictureUrl ? "View photo" : undefined}
        >
          {employee.profilePictureUrl ? (
            <Image
              src={employee.profilePictureUrl}
              alt=""
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-primary bg-primary/10">
              {employee.firstName?.charAt(0)}
              {employee.lastName?.charAt(0)}
            </div>
          )}
        </button>
        
        {employee.employeeId && (
            <div className="text-right pb-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">ID Number</p>
                <p className="font-mono text-sm font-bold text-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/50 mt-0.5">{employee.employeeId}</p>
            </div>
        )}
      </div>

      {/* Main Details (Mixed with Profile view styling) */}
      <div className="flex flex-1 flex-col px-5 pb-5 space-y-4">
        <div>
            <div className="flex items-center gap-1.5">
                <h3 className="truncate text-xl font-bold text-foreground tracking-tight">
                    {employee.firstName} {employee.lastName}
                </h3>
                {employee.isVerified && <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />}
            </div>
            
            <div className="mt-2 flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-muted/50 rounded text-xs font-medium text-muted-foreground border border-border/50">
                    <Briefcase className="h-3 w-3 text-primary" />
                    {employee.designation?.name || "Not set"}
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-muted/50 rounded text-xs font-medium text-muted-foreground border border-border/50">
                    <Building2 className="h-3 w-3 text-primary" />
                    {employee.department?.name || "Not set"}
                </div>
            </div>
        </div>

        {/* Contact Info Box */}
        <div className="space-y-2.5 text-xs bg-muted/20 rounded-xl p-3 border border-border/50 shadow-sm">
            <div className="flex items-center gap-2.5 text-muted-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                <span className="truncate text-foreground font-medium">{employee.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground">
                <Phone className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                <span className="truncate text-foreground font-medium">{employee.phoneNumber || "—"}</span>
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                <span className="truncate text-foreground font-medium">
                {employee.officeLocation?.name || "No office"}
                </span>
            </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default" className="text-[10px] capitalize tracking-wider">
                {employee.employmentType?.replace("_", " ") || "—"}
            </Badge>
            {employee.faceEnrolled && (
                <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Face Enrolled
                </span>
            )}
        </div>
      </div>

      {/* Admin Actions Footer */}
      {isAdminOrHr && (
        <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/10 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(employee)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-4 text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
              aria-label="Edit employee"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </button>
          </div>
        </div>
      )}
    </div>

    {/* Dialog for QR Code */}
    <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
        <DialogContent className="sm:max-w-md p-6 gap-5">
            <DialogHeader className="pr-8 text-left space-y-1">
                <DialogTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-primary" />
                    <span>Employee Profile QR</span>
                </DialogTitle>
                <DialogDescription>Scan to view their digital visiting card.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center p-5 bg-muted/20 rounded-2xl space-y-4 border border-border/50">
                <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-border">
                    <QRCodeSVG 
                        id={`qr-code-${employee.id}`} 
                        value={profileUrl} 
                        size={180} 
                        level="H" 
                        includeMargin={false}
                    />
                </div>
                <div className="text-center space-y-1">
                    <p className="font-bold text-lg text-foreground">{employee.firstName} {employee.lastName}</p>
                    <p className="text-xs text-muted-foreground">{employee.designation?.name || "Employee"} {employee.department && `• ${employee.department.name}`}</p>
                </div>
                <div className="flex items-center justify-center gap-2 w-full pt-1">
                    <button
                        onClick={downloadQr}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium transition-colors cursor-pointer"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Download QR
                    </button>
                    <a
                        href={profileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium transition-colors shadow-sm cursor-pointer"
                    >
                        Open Profile
                    </a>
                </div>
            </div>
        </DialogContent>
    </Dialog>

    <PhotoOverlay
      open={isPhotoOpen}
      onOpenChange={setIsPhotoOpen}
      src={employee.profilePictureUrl || null}
      name={`${employee.firstName || ""} ${employee.lastName || ""}`.trim()}
    />
    </>
  );
}
