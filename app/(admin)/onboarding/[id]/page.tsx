"use client";

import { use } from "react";
import OnboardingDetailPage from "@/components/onboarding/OnboardingDetail";

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <OnboardingDetailPage id={id} />;
}
