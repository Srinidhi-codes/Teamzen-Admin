import React, { Suspense } from "react";
import { EmailTemplatesManager } from "@/components/settings/EmailTemplatesManager";

export const metadata = {
  title: "Email Notifications & Template Designer | Admin Portal",
  description: "Configure system email automations, toggle delivery, and design custom JSX/HTML templates.",
};

export default function EmailTemplatesPage() {
  return (
    <div className="w-full pb-16">
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground text-sm">Loading email templates...</div>}>
        <EmailTemplatesManager />
      </Suspense>
    </div>
  );
}
