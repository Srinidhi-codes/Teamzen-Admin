"use client";

import Link from "next/link";
import Image from "next/image";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 0%, color-mix(in oklch, var(--primary) 14%, transparent), transparent 55%), radial-gradient(ellipse at 80% 100%, color-mix(in oklch, var(--primary) 8%, transparent), transparent 45%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklch, var(--border) 80%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--border) 80%, transparent) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        }}
        aria-hidden
      />

      <div className="relative w-full max-w-lg text-center">
        <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-border shadow-sm">
          <Image
            src="/images/teamzen_zoomed.png"
            alt="Teamzen"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Teamzen Admin
        </p>
        <p className="mt-4 font-mono text-7xl font-semibold tracking-tight text-foreground/15 sm:text-8xl">
          404
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Page not found
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          This page doesn’t exist, or you don’t have access to it. Head back to the
          dashboard to keep managing your organization.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = "/dashboard";
              }
            }}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
