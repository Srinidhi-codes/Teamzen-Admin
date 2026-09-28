import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";

export default function ForgotPassword() {
  return (
    <AuthShell
      title="Forgot password"
      description="Password reset for admin accounts is handled by your IT team."
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-border bg-muted/40 px-4 py-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Self-service reset is not available for administrative accounts. Contact your
            system administrator or IT department to reset your password.
          </p>
        </div>

        <Link
          href="/login"
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}
