"use client";

import { useAIConfig } from "@/lib/api/hooks";
import { useState, useEffect } from "react";
import {
  Cpu,
  Settings2,
  Save,
  Loader2,
  MessageSquareQuote,
  Thermometer,
  Zap,
  Info,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useGraphQLUpdateOrganizationMutation } from "@/lib/graphql/organization/organizationsHook";
import { useStore } from "@/lib/store/useStore";
import { PageHeader } from "@/components/common/PageHeader";

const MODELS = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    desc: "Most capable; best for complex tasks.",
    provider: "OpenAI",
    type: "Premium",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    desc: "Fast and affordable for everyday work.",
    provider: "OpenAI",
    type: "Fast",
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    desc: "Fast responses with a large context window.",
    provider: "Google",
    type: "Fast",
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    desc: "Strong reasoning for complex requests.",
    provider: "Google",
    type: "Premium",
  },
  {
    id: "llama-3.3-70b-versatile",
    name: "Llama 3.3 70B",
    desc: "Versatile open model via Groq.",
    provider: "Groq",
    type: "Balanced",
  },
  {
    id: "llama-3.1-8b-instant",
    name: "Llama 3.1 8B",
    desc: "Very fast responses via Groq.",
    provider: "Groq",
    type: "Speed",
  },
  {
    id: "mixtral-8x7b-32768",
    name: "Mixtral 8x7B",
    desc: "Large context with consistent quality.",
    provider: "Groq",
    type: "Balanced",
  },
];

export default function AISettingsPage() {
  const { user } = useStore();
  const { config, isLoading, isUpdating, updateAIConfig } = useAIConfig();
  const [formData, setFormData] = useState({
    model_name: "gpt-4o-mini",
    temperature: 0.7,
    max_tokens: 1024,
    system_prompt_override: "",
  });

  useEffect(() => {
    if (config) {
      setFormData({
        model_name: config.model_name,
        temperature: config.temperature,
        max_tokens: config.max_tokens,
        system_prompt_override: config.system_prompt_override || "",
      });
    }
  }, [config]);

  const handleSave = async () => {
    try {
      await updateAIConfig(formData);
      toast.success("AI settings saved");
    } catch {
      toast.error("Failed to update AI settings");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="page-shell mx-auto max-w-5xl">
      <PageHeader
        title="AI settings"
        description="Configure the workplace assistant model and behavior."
        actions={
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save changes
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Model</h2>
            </div>
            <div className="space-y-2">
              {MODELS.map((m) => {
                const selected = formData.model_name === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, model_name: m.id }))
                    }
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors",
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Cpu className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">{m.name}</p>
                        <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                          {m.provider} · {m.type}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {m.desc}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "h-4 w-4 shrink-0 rounded-full border-2",
                        selected ? "border-primary bg-primary" : "border-border"
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </section>

          <OrganizationAISettings user={user} />

          <section className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <MessageSquareQuote className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">System prompt</h2>
            </div>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
              <Info className="h-3 w-3" />
              Overrides the default assistant behavior
            </div>
            <textarea
              value={formData.system_prompt_override || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  system_prompt_override: e.target.value,
                }))
              }
              placeholder="e.g. You are a helpful HR assistant focused on clear, concise answers…"
              className="min-h-40 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border border-border bg-card p-5">
            <div className="mb-5 flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Parameters</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="inline-flex items-center gap-1.5 text-sm font-medium">
                    <Thermometer className="h-3.5 w-3.5 text-muted-foreground" />
                    Temperature
                  </label>
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs tabular-nums text-foreground">
                    {formData.temperature.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={formData.temperature}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      temperature: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="inline-flex items-center gap-1.5 text-sm font-medium">
                    <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                    Max tokens
                  </label>
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs tabular-nums text-foreground">
                    {formData.max_tokens}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[256, 512, 1024, 2048, 4096].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, max_tokens: val }))
                      }
                      className={cn(
                        "rounded-md border py-2 text-xs font-medium transition-colors",
                        formData.max_tokens === val
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:bg-muted"
                      )}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-muted/40 p-5">
            <h3 className="text-sm font-semibold text-foreground">Tip</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Use a lower temperature for policy or attendance questions. Raise it slightly for more open-ended recommendations.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function OrganizationAISettings({ user }: { user: any }) {
  const { updateOrganization, isUpdatingOrganizationLoading } =
    useGraphQLUpdateOrganizationMutation();
  const [apiKey, setApiKey] = useState(user?.organization?.llmApiKey || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user?.organization?.id) return;
    setIsSaving(true);
    try {
      await updateOrganization({
        id: user.organization.id,
        name: user.organization.name,
        llmApiKey: apiKey,
        isActive: true,
      });
      toast.success("Organization API key updated");
    } catch {
      toast.error("Failed to update organization API key");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">Organization API key</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Optional key for {user?.organization?.name || "this organization"} so it can use its own provider credentials.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-…"
          className="input flex-1"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || isUpdatingOrganizationLoading}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
        </button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Supports OpenAI, Gemini, and Anthropic keys.
      </p>
    </section>
  );
}
