"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { GripVertical, Loader2, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { OrganizationFilterSelect } from "@/components/common/OrganizationFilterSelect";
import { Skeleton } from "@/components/common/Skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HrOnboardingTourButton } from "@/components/onboarding/OnboardingTour";
import {
  useOnboardingMutations,
  useOnboardingTemplates,
} from "@/lib/graphql/onboarding/onboardingHook";
import type {
  OnboardingTemplate,
  TaskDefinition,
} from "@/lib/graphql/onboarding/types";

const PHASE_OPTIONS = [
  { value: "preboarding", label: "Preboarding" },
  { value: "day1", label: "Day 1" },
  { value: "week1", label: "Week 1" },
  { value: "day30", label: "Day 30" },
  { value: "day90", label: "Day 90" },
] as const;

const ASSIGNEE_OPTIONS = [
  { value: "hire", label: "New hire" },
  { value: "hr", label: "HR" },
  { value: "it", label: "IT" },
  { value: "manager", label: "Manager" },
] as const;

function sortTasks(tasks: TaskDefinition[]) {
  return [...tasks].sort((a, b) => a.sortOrder - b.sortOrder || Number(a.id) - Number(b.id));
}

function orderKey(tasks: TaskDefinition[]) {
  return tasks.map((t) => t.id).join(",");
}

export default function OnboardingTemplatesPage() {
  const [organizationId, setOrganizationId] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [newName, setNewName] = useState("");
  const [orderedTasks, setOrderedTasks] = useState<TaskDefinition[]>([]);
  const [savedOrderKey, setSavedOrderKey] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [reorderError, setReorderError] = useState("");
  const [reorderSaving, setReorderSaving] = useState(false);
  const [copilotPrompt, setCopilotPrompt] = useState("");
  const [copilotBusy, setCopilotBusy] = useState(false);
  const [copilotMsg, setCopilotMsg] = useState("");
  const [taskForm, setTaskForm] = useState({
    title: "",
    phase: "preboarding",
    assigneeRole: "hire",
    dueOffsetDays: 0,
    requiresDocumentCategory: "",
  });
  const { templates, refetch, isLoading } = useOnboardingTemplates(
    organizationId || undefined
  );
  const { createTemplate, upsertTask, deleteTaskDef, reorderTasks, suggestTasks, loading } =
    useOnboardingMutations();

  const selected: OnboardingTemplate | undefined =
    templates.find((t) => t.id === selectedId) || templates[0];

  const serverOrderKey = useMemo(
    () => (selected ? orderKey(sortTasks(selected.taskDefinitions)) : ""),
    [selected]
  );

  const isDirty =
    orderedTasks.length > 0 && orderKey(orderedTasks) !== savedOrderKey;

  useEffect(() => {
    if (!selected) {
      setOrderedTasks([]);
      setSavedOrderKey("");
      return;
    }
    // Don't clobber unsaved drag order while editing
    if (isDirty && selected.id === selectedId) return;

    setSelectedId(selected.id);
    const sorted = sortTasks(selected.taskDefinitions);
    setOrderedTasks(sorted);
    setSavedOrderKey(orderKey(sorted));
    setReorderError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, serverOrderKey]);

  async function saveOrder() {
    if (!selected || !isDirty) return;
    setReorderError("");
    setReorderSaving(true);
    try {
      await reorderTasks({
        variables: {
          templateId: selected.id,
          taskIds: orderedTasks.map((t) => t.id),
        },
      });
      setSavedOrderKey(orderKey(orderedTasks));
      await refetch();
    } catch (e) {
      setReorderError(e instanceof Error ? e.message : "Failed to save order");
    } finally {
      setReorderSaving(false);
    }
  }

  function resetOrder() {
    if (!selected) return;
    const sorted = sortTasks(selected.taskDefinitions);
    setOrderedTasks(sorted);
    setSavedOrderKey(orderKey(sorted));
    setReorderError("");
  }

  function onDragStart(index: number) {
    setDragIndex(index);
  }

  function onDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setOverIndex(index);
  }

  function onDrop(index: number) {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const next = [...orderedTasks];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setOrderedTasks(next);
    setDragIndex(null);
    setOverIndex(null);
  }

  function onDragEnd() {
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboarding templates"
        description="Checklist definitions by phase and assignee. Drag to reorder, then save."
        actions={
          <div className="flex flex-wrap gap-2">
            <HrOnboardingTourButton variant="templates" />
            <Link href="/onboarding" className="rounded-lg border border-border px-3 py-2 text-sm">
              Back to board
            </Link>
          </div>
        }
      />

      <OrganizationFilterSelect value={organizationId} onChange={setOrganizationId} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div
          id="onboarding-template-list"
          className="space-y-3 rounded-xl border border-border bg-card p-4"
        >
          <h3 className="font-semibold">Templates</h3>
          {isLoading && (
            <div className="space-y-2" aria-busy="true">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          )}
          {!isLoading &&
            templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                if (isDirty && !window.confirm("Discard unsaved task order?")) return;
                setSelectedId(t.id);
                setReorderError("");
              }}
              className={`block w-full rounded-lg border px-3 py-2 text-left text-sm ${
                selected?.id === t.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/40"
              }`}
            >
              <div className="font-medium">{t.name}</div>
              <div className="text-xs text-muted-foreground">
                {t.taskDefinitions.length} tasks
                {t.isDefault ? " · default" : ""}
              </div>
            </button>
          ))}
          <div className="border-t border-border pt-3">
            <input
              className="mb-2 w-full rounded-lg border border-border px-3 py-2 text-sm"
              placeholder="New template name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button
              type="button"
              disabled={!newName || loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm text-primary-foreground disabled:opacity-50"
              onClick={async () => {
                await createTemplate({
                  variables: {
                    input: {
                      name: newName,
                      organizationId: organizationId || undefined,
                      tasks: [],
                    },
                  },
                });
                setNewName("");
                refetch();
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create template"
              )}
            </button>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-border bg-card p-4 lg:col-span-2">
          {!selected ? (
            isLoading ? (
              <div className="space-y-3" aria-busy="true">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-72" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-3/4" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select a template</p>
            )
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{selected.name}</h3>
                  <p className="text-sm text-muted-foreground">{selected.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {isDirty && (
                    <span className="text-xs font-medium text-amber-700">
                      Unsaved order
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={!isDirty || reorderSaving}
                    onClick={resetOrder}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    disabled={!isDirty || reorderSaving}
                    onClick={saveOrder}
                    className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-40"
                  >
                    {reorderSaving ? (
                      <>
                        <Loader2 className="mr-1 inline h-3.5 w-3.5 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      "Save order"
                    )}
                  </button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Drag <GripVertical className="inline h-3.5 w-3.5" /> to rearrange,
                then click <strong>Save order</strong>.
              </p>

              {reorderError && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {reorderError}
                </p>
              )}

              <div id="onboarding-task-list" className="space-y-2">
                {orderedTasks.length === 0 && (
                  <p className="text-sm text-muted-foreground">No tasks yet.</p>
                )}
                {orderedTasks.map((task, index) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => onDragStart(index)}
                    onDragOver={(e) => onDragOver(e, index)}
                    onDrop={() => onDrop(index)}
                    onDragEnd={onDragEnd}
                    className={`flex items-start justify-between gap-2 rounded-lg border p-3 transition-colors ${
                      dragIndex === index
                        ? "border-primary bg-primary/5 opacity-70"
                        : overIndex === index
                          ? "border-primary border-dashed bg-muted/40"
                          : "border-border cursor-grab active:cursor-grabbing"
                    }`}
                  >
                    <div className="flex min-w-0 items-start gap-2">
                      <span
                        className="mt-0.5 shrink-0 text-muted-foreground"
                        aria-hidden
                        title="Drag to reorder"
                      >
                        <GripVertical className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          <span className="mr-2 tabular-nums text-muted-foreground">
                            {index + 1}.
                          </span>
                          {task.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {task.phase} · {task.assigneeRole} · offset{" "}
                          {task.dueOffsetDays}d
                          {task.requiresDocumentCategory
                            ? ` · doc:${task.requiresDocumentCategory}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 text-xs text-rose-600"
                      onClick={async () => {
                        if (
                          isDirty &&
                          !window.confirm(
                            "Discard unsaved order and delete this task?"
                          )
                        ) {
                          return;
                        }
                        await deleteTaskDef({ variables: { id: task.id } });
                        setSavedOrderKey("");
                        refetch();
                      }}
                    >
                      <Trash2 className="h-4 w-4 cursor-pointer" />
                    </button>
                  </div>
                ))}
              </div>

              <div
                id="onboarding-ai-copilot"
                className="mt-4 space-y-2 rounded-lg border border-dashed border-border p-3"
              >
                <h4 className="text-sm font-semibold">AI Copilot</h4>
                <p className="text-xs text-muted-foreground">
                  Describe a hiring scenario to generate checklist tasks for this template.
                </p>
                <textarea
                  className="min-h-[72px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  placeholder="e.g. Remote engineering intern joining in Bangalore"
                  value={copilotPrompt}
                  onChange={(e) => setCopilotPrompt(e.target.value)}
                />
                {copilotMsg && (
                  <p className="text-xs text-muted-foreground">{copilotMsg}</p>
                )}
                <button
                  type="button"
                  disabled={copilotBusy || copilotPrompt.trim().length < 5 || !selected}
                  className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50"
                  onClick={async () => {
                    if (!selected) return;
                    if (
                      isDirty &&
                      !window.confirm("Save or reset order first? Continuing will discard unsaved order.")
                    ) {
                      return;
                    }
                    setCopilotBusy(true);
                    setCopilotMsg("");
                    try {
                      const res = await suggestTasks({
                        variables: {
                          input: {
                            prompt: copilotPrompt,
                            organizationId: organizationId || undefined,
                            applyToTemplateId: selected.id,
                          },
                        },
                      });
                      const payload = res.data?.suggestOnboardingTasks;
                      if (!payload?.success) {
                        setCopilotMsg(payload?.error || "Suggestion failed");
                        return;
                      }
                      setCopilotMsg(
                        `Added ${payload.appliedCount} suggested tasks. Review and reorder as needed.`
                      );
                      setCopilotPrompt("");
                      setSavedOrderKey("");
                      refetch();
                    } catch (e) {
                      setCopilotMsg(e instanceof Error ? e.message : "Failed");
                    } finally {
                      setCopilotBusy(false);
                    }
                  }}
                >
                  {copilotBusy ? "Generating…" : "Generate & apply to template"}
                </button>
              </div>

              <div className="mt-4 grid gap-2 rounded-lg border border-dashed border-border p-3 sm:grid-cols-2">
                <input
                  className="rounded border border-border px-2 py-1.5 text-sm sm:col-span-2"
                  placeholder="Task title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                />
                <Select
                  value={taskForm.phase}
                  onValueChange={(value) =>
                    setTaskForm({ ...taskForm, phase: value })
                  }
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="Phase" />
                  </SelectTrigger>
                  <SelectContent>
                    {PHASE_OPTIONS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={taskForm.assigneeRole}
                  onValueChange={(value) =>
                    setTaskForm({ ...taskForm, assigneeRole: value })
                  }
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="Assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNEE_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input
                  type="number"
                  className="rounded border border-border px-2 py-1.5 text-sm"
                  value={taskForm.dueOffsetDays}
                  onChange={(e) =>
                    setTaskForm({
                      ...taskForm,
                      dueOffsetDays: Number(e.target.value),
                    })
                  }
                />
                <input
                  className="rounded border border-border px-2 py-1.5 text-sm"
                  placeholder="doc category (optional)"
                  value={taskForm.requiresDocumentCategory}
                  onChange={(e) =>
                    setTaskForm({
                      ...taskForm,
                      requiresDocumentCategory: e.target.value,
                    })
                  }
                />
                <button
                  type="button"
                  disabled={!taskForm.title || loading}
                  className="rounded-lg bg-primary py-2 text-sm text-primary-foreground sm:col-span-2 disabled:opacity-50"
                  onClick={async () => {
                    if (
                      isDirty &&
                      !window.confirm(
                        "Unsaved order will be discarded when adding a task. Continue?"
                      )
                    ) {
                      return;
                    }
                    await upsertTask({
                      variables: {
                        input: {
                          templateId: selected.id,
                          title: taskForm.title,
                          phase: taskForm.phase,
                          assigneeRole: taskForm.assigneeRole,
                          dueOffsetDays: taskForm.dueOffsetDays,
                          requiresDocumentCategory:
                            taskForm.requiresDocumentCategory || "",
                          sortOrder: (orderedTasks.length + 1) * 10,
                        },
                      },
                    });
                    setTaskForm({
                      title: "",
                      phase: "preboarding",
                      assigneeRole: "hire",
                      dueOffsetDays: 0,
                      requiresDocumentCategory: "",
                    });
                    setSavedOrderKey("");
                    refetch();
                  }}
                >
                  Add task
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
