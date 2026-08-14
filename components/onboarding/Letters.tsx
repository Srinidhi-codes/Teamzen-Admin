"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { OrganizationFilterSelect } from "@/components/common/OrganizationFilterSelect";
import { Skeleton } from "@/components/common/Skeleton";
import { HrOnboardingTourButton } from "@/components/onboarding/OnboardingTour";
import {
  useLetterTemplates,
  useOnboardingMutations,
} from "@/lib/graphql/onboarding/onboardingHook";

export default function LetterTemplatesPage() {
  const [organizationId, setOrganizationId] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [polishMsg, setPolishMsg] = useState("");
  const [polishing, setPolishing] = useState(false);
  const [letterTypeFilter, setLetterTypeFilter] = useState("offer");
  const [form, setForm] = useState({
    name: "",
    subject: "",
    bodyHtml: "",
    isDefault: false,
  });
  const { templates, refetch, isLoading } = useLetterTemplates(
    organizationId || undefined,
    letterTypeFilter
  );
  const { createLetter, updateLetter, polishOffer, loading } =
    useOnboardingMutations();

  const selected = templates.find((t) => t.id === selectedId) || templates[0];

  useEffect(() => {
    if (selected) {
      setForm({
        name: selected.name,
        subject: selected.subject,
        bodyHtml: selected.bodyHtml,
        isDefault: selected.isDefault,
      });
      setSelectedId(selected.id);
    }
  }, [selected?.id]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Letter templates"
        description="Offer, experience, relieving, and salary certificates. Tokens like {{exit_date}} work on exit letters."
        actions={
          <div className="flex flex-wrap gap-2">
            <HrOnboardingTourButton variant="letters" />
            <Link
              href="/onboarding"
              className="rounded-lg border border-border px-3 py-2 text-sm"
            >
              Back to board
            </Link>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        {[
          ["offer", "Offer"],
          ["experience", "Experience"],
          ["relieving", "Relieving"],
          ["salary_certificate", "Salary certificate"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setLetterTypeFilter(value);
              setSelectedId("");
            }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              letterTypeFilter === value
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Insert these tokens in subject or body
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            "employee_name",
            "designation",
            "department",
            "join_date",
            "exit_date",
            "last_working_day",
            "tenure",
            "company_name",
          ].map((token) => (
            <code
              key={token}
              className="rounded-md border border-border bg-background px-2 py-1 font-mono text-xs text-foreground"
            >
              {`{{${token}}}`}
            </code>
          ))}
        </div>
      </div>

      <OrganizationFilterSelect value={organizationId} onChange={setOrganizationId} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-2 rounded-xl border border-border bg-card p-4">
          <h3 className="font-semibold">Templates</h3>
          {isLoading && (
            <div className="space-y-2" aria-busy="true">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          )}
          {!isLoading &&
            templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedId(t.id)}
              className={`block w-full rounded-lg border px-3 py-2 text-left text-sm ${
                selected?.id === t.id
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
            >
              {t.name}
              {t.isDefault ? " (default)" : ""}
            </button>
          ))}
          <button
            type="button"
            className="mt-2 w-full rounded-lg border border-dashed border-border py-2 text-sm"
            disabled={loading}
            onClick={async () => {
              await createLetter({
                variables: {
                  input: {
                    name: `New ${letterTypeFilter.replace(/_/g, " ")} template`,
                    letterType: letterTypeFilter,
                    subject:
                      letterTypeFilter === "offer"
                        ? "Offer of Employment — {{company_name}}"
                        : `${letterTypeFilter.replace(/_/g, " ")} — {{employee_name}}`,
                    bodyHtml:
                      letterTypeFilter === "offer"
                        ? "<p>Dear {{employee_name}},</p><p>We are pleased to offer you {{designation}}.</p>"
                        : "<p>This letter confirms details for {{employee_name}} ({{designation}}) at {{company_name}}.</p><p>Join: {{join_date}}. Exit: {{exit_date}}.</p>",
                    organizationId: organizationId || undefined,
                  },
                },
              });
              refetch();
            }}
          >
            + New template
          </button>
        </div>

        <div
          id="onboarding-letter-editor"
          className="space-y-3 rounded-xl border border-border bg-card p-4 lg:col-span-2"
        >
          {!selected ? (
            isLoading ? (
              <div className="space-y-3" aria-busy="true">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-60 w-full" />
                <Skeleton className="h-9 w-32" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No templates yet</p>
            )
          ) : (
            <>
              <input
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
              <textarea
                className="min-h-[240px] w-full rounded-lg border border-border px-3 py-2 font-mono text-sm"
                value={form.bodyHtml}
                onChange={(e) => setForm({ ...form, bodyHtml: e.target.value })}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) =>
                    setForm({ ...form, isDefault: e.target.checked })
                  }
                />
                Default offer template
              </label>
              {polishMsg && (
                <p className="text-xs text-muted-foreground">{polishMsg}</p>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  id="onboarding-letter-polish"
                  disabled={polishing || !form.bodyHtml.trim()}
                  className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-50"
                  onClick={async () => {
                    setPolishing(true);
                    setPolishMsg("");
                    try {
                      const res = await polishOffer({
                        variables: {
                          input: {
                            bodyHtml: form.bodyHtml,
                            organizationId: organizationId || undefined,
                            tone: "professional",
                            save: false,
                          },
                        },
                      });
                      const payload = res.data?.polishOfferLetter;
                      if (!payload?.success) {
                        setPolishMsg(payload?.error || "Polish failed");
                        return;
                      }
                      setForm({ ...form, bodyHtml: payload.bodyHtml });
                      setPolishMsg("Polished — review then Save template.");
                    } catch (e) {
                      setPolishMsg(e instanceof Error ? e.message : "Failed");
                    } finally {
                      setPolishing(false);
                    }
                  }}
                >
                  {polishing ? (
                    <>
                      <Loader2 className="mr-1 inline h-4 w-4 animate-spin" />
                      Polishing…
                    </>
                  ) : (
                    "AI Polish"
                  )}
                </button>
                <button
                  type="button"
                  disabled={loading || polishing}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
                  onClick={async () => {
                    await updateLetter({
                      variables: {
                        input: {
                          id: selected.id,
                          name: form.name,
                          subject: form.subject,
                          bodyHtml: form.bodyHtml,
                          isDefault: form.isDefault,
                        },
                      },
                    });
                    refetch();
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save template"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
