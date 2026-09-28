export type PlanId = "free" | "pro" | "elite";

export type PlanFeature =
  | "payroll_basic"
  | "payroll_auto_run"
  | "salary_advances"
  | "org_llm_key"
  | "advanced_analytics"
  | "ai_assistant"
  | "custom_accent"
  | "policies"
  | "face_attendance";

export const PLAN_ORDER: PlanId[] = ["free", "pro", "elite"];

const PLAN_FEATURES: Record<PlanId, PlanFeature[]> = {
  free: ["payroll_basic", "policies"],
  pro: [
    "payroll_basic",
    "ai_assistant",
    "custom_accent",
    "policies",
    "payroll_auto_run",
    "salary_advances",
    "face_attendance",
  ],
  elite: [
    "payroll_basic",
    "ai_assistant",
    "custom_accent",
    "policies",
    "payroll_auto_run",
    "salary_advances",
    "face_attendance",
    "org_llm_key",
    "advanced_analytics",
  ],
};

export function normalizePlan(plan?: string | null): PlanId {
  const p = (plan || "free").toLowerCase();
  if (p === "pro" || p === "elite") return p;
  return "free";
}

export function planLabel(plan?: string | null) {
  const p = normalizePlan(plan);
  if (p === "pro") return "Pro";
  if (p === "elite") return "Elite";
  return "Free";
}

export function planBadgeClass(plan?: string | null) {
  const p = normalizePlan(plan);
  if (p === "elite") return "bg-violet-500/15 text-violet-700 dark:text-violet-300";
  if (p === "pro") return "bg-sky-500/15 text-sky-700 dark:text-sky-300";
  return "bg-muted text-muted-foreground";
}

export function canUpgradePlan(plan?: string | null) {
  return normalizePlan(plan) !== "elite";
}

export function nextPlan(plan?: string | null): PlanId | null {
  const p = normalizePlan(plan);
  if (p === "free") return "pro";
  if (p === "pro") return "elite";
  return null;
}

/** Whole calendar days until expiry (can be negative if past). Null if no expiry. */
export function daysUntilExpiry(expiresAt?: string | null): number | null {
  if (!expiresAt) return null;
  const end = new Date(expiresAt);
  if (Number.isNaN(end.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/** Paid plan that has passed expiry is treated as Free for entitlements. */
export function effectivePlan(
  plan?: string | null,
  expiresAt?: string | null
): PlanId {
  const p = normalizePlan(plan);
  if (p === "free") return "free";
  const days = daysUntilExpiry(expiresAt);
  if (days !== null && days < 0) return "free";
  return p;
}

export function hasPlanFeature(
  plan?: string | null,
  expiresAt?: string | null,
  feature?: PlanFeature
): boolean {
  if (!feature) return true;
  const active = effectivePlan(plan, expiresAt);
  return PLAN_FEATURES[active].includes(feature);
}

export function effectiveAccent(
  accent?: string | null,
  plan?: string | null,
  expiresAt?: string | null
): string {
  if (!hasPlanFeature(plan, expiresAt, "custom_accent")) return "teal";
  return accent || "teal";
}

export function minPlanForFeature(feature: PlanFeature): PlanId {
  if (PLAN_FEATURES.free.includes(feature)) return "free";
  if (PLAN_FEATURES.pro.includes(feature)) return "pro";
  return "elite";
}

/** Show banner when paid plan expires within 30 days (including expired). */
export function shouldShowPlanExpiryBanner(
  plan?: string | null,
  expiresAt?: string | null
): boolean {
  if (normalizePlan(plan) === "free") return false;
  const days = daysUntilExpiry(expiresAt);
  if (days === null) return false;
  return days <= 30;
}

export const PLAN_CATALOG: {
  id: PlanId;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  blurb: string;
  features: string[];
}[] = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    blurb: "Core HR for small teams getting started.",
    features: ["Attendance & leaves", "Basic payroll", "Policies"],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 3999,
    yearlyPrice: 39990,
    blurb: "Automation and AI for growing orgs.",
    features: [
      "Everything in Free",
      "AI assistant",
      "AI write",
      "Company color themes",
      "Face attendance",
      "Payroll auto-run",
      "Salary advances",
      "Priority support",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    monthlyPrice: 14999,
    yearlyPrice: 149990,
    blurb: "Full control for multi-site and advanced ops.",
    features: [
      "Everything in Pro",
      "Org LLM keys",
      "Performance & analytics",
      "Dedicated onboarding",
    ],
  },
];

export const BILLING_CYCLES = [
  { id: "monthly", label: "Monthly", days: 30 },
  { id: "yearly", label: "Yearly", days: 365 },
] as const;

export type BillingCycleId = (typeof BILLING_CYCLES)[number]["id"];

export function formatPlanPrice(
  plan: (typeof PLAN_CATALOG)[number],
  cycle: BillingCycleId
): { primary: string; secondary?: string } {
  if (plan.monthlyPrice === 0) {
    return { primary: "₹0" };
  }
  if (cycle === "yearly") {
    const perMonth = Math.round(plan.yearlyPrice / 12);
    return {
      primary: `₹${plan.yearlyPrice.toLocaleString("en-IN")}/yr`,
      secondary: `₹${perMonth.toLocaleString("en-IN")}/mo billed yearly`,
    };
  }
  return {
    primary: `₹${plan.monthlyPrice.toLocaleString("en-IN")}/mo`,
    secondary: `or ₹${plan.yearlyPrice.toLocaleString("en-IN")}/yr`,
  };
}

