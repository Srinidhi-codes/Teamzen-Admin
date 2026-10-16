import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes a portal URL (e.g. preboarding or exit magic link) on the client side.
 * If running in production (e.g. Vercel) and the URL still contains localhost:3000,
 * it rewrites the origin to match the production client domain dynamically.
 */
export function normalizePortalUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (typeof window === "undefined") return trimmed;

  const currentHost = window.location.hostname;
  const isLocalHost = currentHost === "localhost" || currentHost === "127.0.0.1";

  // If in local dev, allow localhost as is
  if (isLocalHost) {
    return trimmed;
  }

  // In production: if the URL points to localhost, rewrite it
  if (trimmed.includes("localhost:3000") || trimmed.includes("127.0.0.1:3000") || trimmed.includes("localhost:3001")) {
    const envClientUrl = (process.env.NEXT_PUBLIC_FRONTEND_URL || "").replace(/\/+$/, "");
    let targetOrigin = envClientUrl;

    if (!targetOrigin || targetOrigin.includes("localhost")) {
      const origin = window.location.origin;
      if (origin.includes("-admin")) {
        targetOrigin = origin.replace("-admin", "-client");
      } else if (origin.includes("admin.")) {
        targetOrigin = origin.replace("admin.", "");
      } else {
        targetOrigin = origin;
      }
    }

    try {
      const parsed = new URL(trimmed);
      return `${targetOrigin}${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return trimmed.replace(/^https?:\/\/[^/]+/, targetOrigin);
    }
  }

  return trimmed;
}
