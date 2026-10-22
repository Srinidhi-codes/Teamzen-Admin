"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  GET_EMAIL_TEMPLATE_SETTINGS,
} from "@/lib/graphql/email-templates/queries";
import {
  UPDATE_EMAIL_TEMPLATE,
  TOGGLE_EMAIL_TEMPLATE,
  RESET_EMAIL_TEMPLATE,
  SEND_TEST_EMAIL,
} from "@/lib/graphql/email-templates/mutations";
import {
  Mail,
  MailX,
  Sparkles,
  Search,
  SlidersHorizontal,
  RefreshCw,
  Send,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  CheckCircle2,
  RotateCcw,
  Code,
  Copy,
  Check,
  ShieldCheck,
  FileCode,
  Wand2,
  Maximize2,
  Minimize2,
  Columns2,
  Sun,
  Moon,
  X,
  PenTool,
  Loader,
  Eye,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store/useStore";
import { Pagination } from "@/components/common/Pagination";
import { toast } from "sonner";

export interface EmailTemplateItem {
  key: string;
  name: string;
  category: string;
  customCategory?: string | null;
  description: string;
  isEnabled: boolean;
  defaultSubject: string;
  defaultHeadline: string;
  defaultBody: string;
  defaultCtaText: string | null;
  defaultCtaUrl: string | null;
  defaultFooter: string;
  customSubject: string | null;
  customHeadline: string | null;
  customBody: string | null;
  customCtaText: string | null;
  customCtaUrl: string | null;
  customFooter: string | null;
  isRawHtmlMode: boolean;
  customFullHtml: string | null;
  activeSubject: string;
  activeHeadline: string;
  activeBody: string;
  activeCtaText: string | null;
  activeCtaUrl: string | null;
  activeFooter: string;
  availableTokens: string[];
  sampleContextJson: string;
  previewHtml: string;
  isCustomized: boolean;
  updatedAt: string | null;
}

export function normalizeCategoryKey(cat: string): string {
  const c = (cat || "").toLowerCase().trim();
  if (c.includes("leave")) return "leave";
  if (c.includes("sec") || c.includes("auth") || c.includes("access") || c.includes("login")) return "auth";
  if (c.includes("attend")) return "attendance";
  if (c.includes("pay") || c.includes("salary") || c.includes("finance")) return "payroll";
  if (c.includes("life") || c.includes("onboard") || c.includes("hr")) return "lifecycle";
  if (c.includes("gen")) return "general";
  return c || "general";
}

const CATEGORY_META: Record<
  string,
  { label: string; color: string }
> = {
  all: { label: "All Categories", color: "text-foreground" },
  leave: { label: "Leave Management", color: "text-sky-500" },
  auth: { label: "Security & Access", color: "text-amber-500" },
  attendance: { label: "Attendance", color: "text-emerald-500" },
  payroll: { label: "Payroll & Finance", color: "text-indigo-500" },
  lifecycle: { label: "HR & Lifecycle", color: "text-purple-500" },
  general: { label: "General", color: "text-teal-500" },
};

/** Converts pasted React / JSX attributes into standard email-safe HTML */
function convertJsxToHtml(jsxCode: string): string {
  let html = jsxCode;
  // Replace className="..." or className={'...'} with class="..."
  html = html.replace(/className=(?:\{['"]([^'"]+)['"]\}|["']([^"']+)["'])/g, 'class="$1$2"');
  // Replace htmlFor with for
  html = html.replace(/htmlFor=/g, "for=");
  // Convert style={{ color: 'red', fontSize: '14px' }} to style="color:red;font-size:14px;"
  html = html.replace(/style=\{\{([^}]+)\}\}/g, (_match, inner) => {
    try {
      const declarations = inner.split(",").map((part: string) => {
        const [prop, val] = part.split(":").map((s: string) => s.trim().replace(/['"]/g, ""));
        if (!prop || !val) return "";
        const kebab = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
        return `${kebab}:${val};`;
      });
      return `style="${declarations.filter(Boolean).join("")}"`;
    } catch {
      return "";
    }
  });
  return html;
}

/** Generates rendered email preview HTML for an EmailTemplateItem with sample data substituted */
function getTemplatePreviewHtml(tpl: EmailTemplateItem): string {
  if (tpl.previewHtml && tpl.previewHtml.trim()) {
    return tpl.previewHtml;
  }
  let sampleData: Record<string, string> = {};
  try {
    sampleData = JSON.parse(tpl.sampleContextJson || "{}");
  } catch {
    sampleData = {};
  }
  const subTokens = (text: string) => {
    let res = text;
    Object.entries(sampleData).forEach(([k, v]) => {
      res = res.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), String(v));
    });
    return res;
  };

  if (tpl.isRawHtmlMode && tpl.customFullHtml) {
    const rendered = subTokens(tpl.customFullHtml);
    if (rendered.toLowerCase().includes("<html") || rendered.toLowerCase().includes("<!doctype")) {
      return rendered;
    }
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{margin:0;padding:20px;font-family:-apple-system,sans-serif;background:#f8fafc;color:#1e293b;}</style></head><body>${rendered}</body></html>`;
  }

  const renderedHeadline = subTokens(tpl.activeHeadline);
  const renderedBody = subTokens(tpl.activeBody).replace(/\n/g, "<br/>");
  const renderedCtaText = subTokens(tpl.activeCtaText || "");
  const renderedCtaUrl = subTokens(tpl.activeCtaUrl || "#");
  const renderedFooter = subTokens(tpl.activeFooter);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 24px 16px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; }
        .email-card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .topline { height: 4px; background-color: #0F766E; }
        .email-header { padding: 24px 32px 18px 32px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .eyebrow { margin: 0 0 4px 0; color: #0F766E; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; }
        .email-headline { margin: 0; font-size: 21px; font-weight: 700; color: #0f172a; letter-spacing: -0.02em; }
        .brand-badge { width: 38px; height: 38px; border-radius: 8px; background-color: #0F766E; color: #ffffff; font-size: 18px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
        .email-body { padding: 28px 32px 18px 32px; font-size: 15px; line-height: 1.7; color: #334155; }
        .cta-wrap { margin: 20px 0 24px 0; text-align: left; }
        .cta-btn { display: inline-block; background: #0F766E; color: #ffffff !important; padding: 12px 26px; border-radius: 8px; font-weight: 700; font-size: 14px; text-decoration: none; }
        .hint-card { margin: 18px 0 6px 0; padding: 12px 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; color: #64748b; line-height: 1.5; }
        .email-footer { padding: 22px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; line-height: 1.5; }
        .footer-links a { color: #0F766E; text-decoration: none; margin: 0 8px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="email-card">
        <div class="topline"></div>
        <div class="email-header">
          <div>
            <div class="eyebrow">Teamzen</div>
            <h1 class="email-headline">${renderedHeadline}</h1>
          </div>
          <div class="brand-badge">T</div>
        </div>
        <div class="email-body">
          <div>${renderedBody}</div>
          ${renderedCtaText ? `<div class="cta-wrap"><a href="${renderedCtaUrl}" target="_blank" class="cta-btn">${renderedCtaText} &rarr;</a></div>` : ""}
          ${renderedFooter ? `<div class="hint-card">${renderedFooter}</div>` : ""}
        </div>
        <div class="email-footer">
          <p style="margin: 0 0 10px 0;">This notification was delivered securely by Teamzen HRMS.</p>
          <div class="footer-links">
            <a href="#">Workspace Portal</a> &bull; <a href="#">Help & Support</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function EmailTemplatesManager() {
  const { user } = useStore();
  const isSuperadmin = user?.role === "superadmin";
  const isAdmin = user?.role === "admin";

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (useStore.persist?.hasHydrated?.()) {
      setIsHydrated(true);
      return;
    }
    const unsub = useStore.persist?.onFinishHydration?.(() => {
      setIsHydrated(true);
    });
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 150);
    return () => {
      unsub?.();
      clearTimeout(timer);
    };
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "muted" | "customized">("all");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Active template being customized in modal
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplateItem | null>(null);

  // Full-screen preview studio state
  const [fullScreenPreviewData, setFullScreenPreviewData] = useState<{
    title: string;
    category: string;
    subject: string;
    html: string;
    isEnabled: boolean;
    isCustomized: boolean;
    templateKey: string;
  } | null>(null);

  const [fullScreenDevice, setFullScreenDevice] = useState<"desktop" | "laptop" | "tablet" | "mobile" | "fluid">("desktop");
  const [fullScreenTheme, setFullScreenTheme] = useState<"light" | "dark">("light");

  // Designer modal fullscreen workspace toggle
  const [isDesignerFullScreen, setIsDesignerFullScreen] = useState(false);

  // Designer view mode: split, editor only, or preview only
  const [designerViewMode, setDesignerViewMode] = useState<"split" | "editor" | "preview">("split");

  // Mobile / tablet sub-tab switcher for designer modal
  const [mobileDesignerTab, setMobileDesignerTab] = useState<"editor" | "preview">("editor");

  // Form state
  const [editorMode, setEditorMode] = useState<"builder" | "raw_html">("builder");
  const [formCategoryChoice, setFormCategoryChoice] = useState<string>("General");
  const [formCustomCategory, setFormCustomCategory] = useState<string>("");
  const [formSubject, setFormSubject] = useState("");
  const [formHeadline, setFormHeadline] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formCtaText, setFormCtaText] = useState("");
  const [formCtaUrl, setFormCtaUrl] = useState("");
  const [formFooter, setFormFooter] = useState("");
  const [formRawHtml, setFormRawHtml] = useState("");
  const [formIsEnabled, setFormIsEnabled] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [copiedCode, setCopiedCode] = useState(false);

  // Test email modal
  const [testEmailModalOpen, setTestEmailModalOpen] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState(user?.email || "");
  const [testTemplateKey, setTestTemplateKey] = useState<string | null>(null);

  const rawHtmlTextareaRef = useRef<HTMLTextAreaElement>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Close full-screen preview on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && fullScreenPreviewData) {
        setFullScreenPreviewData(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fullScreenPreviewData]);

  // GraphQL queries and mutations
  const { data, loading, refetch } = useQuery<{
    emailTemplateSettings: EmailTemplateItem[];
  }>(GET_EMAIL_TEMPLATE_SETTINGS, {
    variables: { category: selectedCategory === "all" ? null : selectedCategory },
    fetchPolicy: "cache-and-network",
    skip: !isAdmin && !isSuperadmin,
  });

  const [updateTemplate, { loading: isUpdating }] = useMutation(UPDATE_EMAIL_TEMPLATE, {
    onCompleted: () => {
      toast.success("Email template saved successfully");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update template");
    },
  });

  const [toggleTemplate] = useMutation(TOGGLE_EMAIL_TEMPLATE, {
    onCompleted: (_data, clientOptions: any) => {
      const isEnabled = clientOptions?.variables?.isEnabled ?? clientOptions?.isEnabled;
      const state = isEnabled ? "enabled" : "muted";
      toast.success(`Email notification ${state}`);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to toggle email setting");
    },
  });

  const [resetTemplate, { loading: isResetting }] = useMutation(RESET_EMAIL_TEMPLATE, {
    onCompleted: () => {
      toast.success("Template reverted to system default");
      refetch();
      if (editingTemplate) {
        setFormCategoryChoice("General");
        setFormCustomCategory("");
        setFormSubject(editingTemplate.defaultSubject);
        setFormHeadline(editingTemplate.defaultHeadline);
        setFormBody(editingTemplate.defaultBody);
        setFormCtaText(editingTemplate.defaultCtaText || "");
        setFormCtaUrl(editingTemplate.defaultCtaUrl || "");
        setFormFooter(editingTemplate.defaultFooter);
        setFormRawHtml("");
        setEditorMode("builder");
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to reset template");
    },
  });

  const [sendTestEmail, { loading: isSendingTest }] = useMutation(SEND_TEST_EMAIL, {
    onCompleted: () => {
      toast.success(`Test email dispatched to ${testEmailRecipient}`);
      setTestEmailModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to send test email");
    },
  });

  const templates = data?.emailTemplateSettings || [];

  // Collect any custom categories present in templates that aren't among standard keys
  const customCategories = useMemo(() => {
    const stdNorms = new Set(["all", "leave", "auth", "attendance", "payroll", "lifecycle", "general"]);
    const set = new Set<string>();
    templates.forEach((t) => {
      const norm = normalizeCategoryKey(t.category);
      if (!stdNorms.has(norm) && t.category && t.category.trim()) {
        set.add(t.category.trim());
      }
    });
    return Array.from(set);
  }, [templates]);

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      const tplNorm = normalizeCategoryKey(tpl.category);
      const selNorm = normalizeCategoryKey(selectedCategory);
      const matchCat =
        selectedCategory === "all" ||
        tplNorm === selNorm ||
        tpl.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchQuery =
        !searchQuery ||
        tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.activeSubject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && tpl.isEnabled) ||
        (statusFilter === "muted" && !tpl.isEnabled) ||
        (statusFilter === "customized" && tpl.isCustomized);

      return matchCat && matchQuery && matchStatus;
    });
  }, [templates, selectedCategory, searchQuery, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, selectedCategory]);

  const totalPages = Math.ceil(filteredTemplates.length / pageSize);
  const paginatedTemplates = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTemplates.slice(start, start + pageSize);
  }, [filteredTemplates, page, pageSize]);

  // Statistics
  const totalCount = templates.length;
  const activeCount = templates.filter((t) => t.isEnabled).length;
  const mutedCount = totalCount - activeCount;
  const customizedCount = templates.filter((t) => t.isCustomized).length;

  // Open designer modal
  const handleOpenDesigner = (tpl: EmailTemplateItem) => {
    setEditingTemplate(tpl);
    setFormIsEnabled(tpl.isEnabled);

    const STANDARD_CATEGORIES = [
      "Leave Management",
      "Security & Access",
      "Attendance",
      "Payroll & Finance",
      "HR & Lifecycle",
      "General",
    ];
    const matchingStd = STANDARD_CATEGORIES.find(
      (sc) =>
        sc.toLowerCase() === tpl.category.toLowerCase() ||
        normalizeCategoryKey(sc) === normalizeCategoryKey(tpl.category)
    );
    if (matchingStd) {
      setFormCategoryChoice(matchingStd);
      setFormCustomCategory("");
    } else {
      setFormCategoryChoice("other");
      setFormCustomCategory(tpl.category || "");
    }

    setFormSubject(tpl.customSubject ?? tpl.defaultSubject);
    setFormHeadline(tpl.customHeadline ?? tpl.defaultHeadline);
    setFormBody(tpl.customBody ?? tpl.defaultBody);
    setFormCtaText(tpl.customCtaText ?? tpl.defaultCtaText ?? "");
    setFormCtaUrl(tpl.customCtaUrl ?? tpl.defaultCtaUrl ?? "");
    setFormFooter(tpl.customFooter ?? tpl.defaultFooter);
    setFormRawHtml(tpl.customFullHtml ?? "");
    setEditorMode(tpl.isRawHtmlMode && tpl.customFullHtml ? "raw_html" : "builder");
  };

  // Insert token chip into textarea
  const handleInsertToken = (token: string) => {
    const placeholder = `{{${token}}}`;
    const textarea = editorMode === "raw_html" ? rawHtmlTextareaRef.current : bodyTextareaRef.current;
    if (!textarea) {
      if (editorMode === "raw_html") setFormRawHtml((prev) => prev + ` ${placeholder} `);
      else setFormBody((prev) => prev + ` ${placeholder} `);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const nextText = text.substring(0, start) + placeholder + text.substring(end);
    if (editorMode === "raw_html") setFormRawHtml(nextText);
    else setFormBody(nextText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
    }, 50);
  };

  // Quick switch toggle for card
  const handleToggleCard = async (tpl: EmailTemplateItem, checked: boolean) => {
    await toggleTemplate({
      variables: {
        templateKey: tpl.key,
        isEnabled: checked,
      },
      optimisticResponse: {
        toggleEmailTemplate: true,
      },
    });
  };

  // Auto-select the first template when templates load or filter changes if none selected or selected filtered out
  useEffect(() => {
    if (filteredTemplates.length > 0) {
      if (!editingTemplate || !filteredTemplates.some((t) => t.key === editingTemplate.key)) {
        handleOpenDesigner(filteredTemplates[0]);
      }
    }
  }, [filteredTemplates, editingTemplate]);

  // Save changes
  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    const isRaw = editorMode === "raw_html";
    const finalCategory =
      formCategoryChoice === "other"
        ? (formCustomCategory.trim() || "General")
        : formCategoryChoice;

    await updateTemplate({
      variables: {
        templateKey: editingTemplate.key,
        isEnabled: formIsEnabled,
        customCategory: finalCategory,
        customSubject: formSubject,
        customHeadline: formHeadline,
        customBody: formBody,
        customCtaText: formCtaText || null,
        customCtaUrl: formCtaUrl || null,
        customFooter: formFooter,
        isRawHtmlMode: isRaw,
        customFullHtml: isRaw ? formRawHtml : null,
      },
    });

    setEditingTemplate((prev) =>
      prev
        ? {
            ...prev,
            category: finalCategory,
            customCategory: finalCategory,
            customSubject: formSubject,
            customHeadline: formHeadline,
            customBody: formBody,
            customCtaText: formCtaText,
            customCtaUrl: formCtaUrl,
            customFooter: formFooter,
            customFullHtml: isRaw ? formRawHtml : null,
            isRawHtmlMode: isRaw,
            isEnabled: formIsEnabled,
            isCustomized: true,
            activeSubject: formSubject,
            activeHeadline: formHeadline,
            activeBody: formBody,
            activeCtaText: formCtaText,
            activeCtaUrl: formCtaUrl,
            activeFooter: formFooter,
          }
        : null
    );
  };

  // Live client substitution preview
  const livePreviewHtml = useMemo(() => {
    if (!editingTemplate) return "";
    let sampleData: Record<string, string> = {};
    try {
      sampleData = JSON.parse(editingTemplate.sampleContextJson || "{}");
    } catch {
      sampleData = {};
    }

    const subTokens = (text: string) => {
      let res = text;
      Object.entries(sampleData).forEach(([k, v]) => {
        res = res.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), String(v));
      });
      return res;
    };

    // If in Raw HTML / JSX paste mode
    if (editorMode === "raw_html" && formRawHtml.trim()) {
      const renderedCode = subTokens(formRawHtml);
      if (renderedCode.toLowerCase().includes("<html") || renderedCode.toLowerCase().includes("<!doctype")) {
        return renderedCode;
      }
      return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{margin:0;padding:20px;font-family:-apple-system,sans-serif;background:#f8fafc;color:#1e293b;}</style></head><body>${renderedCode}</body></html>`;
    }

    // Builder mode
    const renderedHeadline = subTokens(formHeadline || editingTemplate.defaultHeadline);
    const renderedBody = subTokens(formBody || editingTemplate.defaultBody).replace(/\n/g, "<br/>");
    const renderedCtaText = subTokens(formCtaText);
    const renderedCtaUrl = subTokens(formCtaUrl || "#");
    const renderedFooter = subTokens(formFooter || editingTemplate.defaultFooter);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; padding: 24px 16px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; }
          .email-card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .topline { height: 4px; background-color: #0F766E; }
          .email-header { padding: 24px 32px 18px 32px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
          .eyebrow { margin: 0 0 4px 0; color: #0F766E; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; }
          .email-headline { margin: 0; font-size: 21px; font-weight: 700; color: #0f172a; letter-spacing: -0.02em; }
          .brand-badge { width: 38px; height: 38px; border-radius: 8px; background-color: #0F766E; color: #ffffff; font-size: 18px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
          .email-body { padding: 28px 32px 18px 32px; font-size: 15px; line-height: 1.7; color: #334155; }
          .cta-wrap { margin: 20px 0 24px 0; text-align: left; }
          .cta-btn { display: inline-block; background: #0F766E; color: #ffffff !important; padding: 12px 26px; border-radius: 8px; font-weight: 700; font-size: 14px; text-decoration: none; }
          .hint-card { margin: 18px 0 6px 0; padding: 12px 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; color: #64748b; line-height: 1.5; }
          .email-footer { padding: 22px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; line-height: 1.5; }
          .footer-links a { color: #0F766E; text-decoration: none; margin: 0 8px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="email-card">
          <div class="topline"></div>
          <div class="email-header">
            <div>
              <div class="eyebrow">Teamzen</div>
              <h1 class="email-headline">${renderedHeadline}</h1>
            </div>
            <div class="brand-badge">T</div>
          </div>
          <div class="email-body">
            <div>${renderedBody}</div>
            ${renderedCtaText ? `<div class="cta-wrap"><a href="${renderedCtaUrl}" target="_blank" class="cta-btn">${renderedCtaText} &rarr;</a></div>` : ""}
            ${renderedFooter ? `<div class="hint-card">${renderedFooter}</div>` : ""}
          </div>
          <div class="email-footer">
            <p style="margin: 0 0 10px 0;">This notification was delivered securely by Teamzen HRMS.</p>
            <div class="footer-links">
              <a href="#">Workspace Portal</a> &bull; <a href="#">Help & Support</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }, [editingTemplate, editorMode, formRawHtml, formHeadline, formBody, formCtaText, formCtaUrl, formFooter]);

  // Live subject preview
  const liveSubjectPreview = useMemo(() => {
    if (!editingTemplate) return "";
    let sampleData: Record<string, string> = {};
    try {
      sampleData = JSON.parse(editingTemplate.sampleContextJson || "{}");
    } catch {
      sampleData = {};
    }
    let res = formSubject || editingTemplate.defaultSubject;
    Object.entries(sampleData).forEach(([k, v]) => {
      res = res.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), String(v));
    });
    return res;
  }, [editingTemplate, formSubject]);

  // While store is hydrating on page reload, render a smooth skeleton placeholder instead of flashing "Access Restricted"
  if (!isHydrated && !isAdmin && !isSuperadmin) {
    return (
      <div className="w-full space-y-6 animate-pulse">
        <div className="flex flex-col gap-2">
          <div className="h-3 w-40 rounded bg-muted/60" />
          <div className="h-8 w-72 rounded bg-muted/80" />
          <div className="h-4 w-96 rounded bg-muted/50" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-2xl border border-border bg-card p-4" />
          ))}
        </div>
        <div className="h-[650px] rounded-2xl border border-border bg-card" />
      </div>
    );
  }

  // Genuinely unauthorized user (once store has fully hydrated)
  if (isHydrated && !isAdmin && !isSuperadmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldCheck className="h-12 w-12 text-rose-500 mb-3" />
        <h2 className="text-lg font-bold text-foreground">Access Restricted</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          Email Automations and Template Designer is restricted exclusively to Admin and Super Admin personnel.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary dark:text-[#38ABB1] mb-1">
            COMMUNICATIONS &amp; AUTOMATIONS
          </p>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Email Automations &amp; Template Designer
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Control which transactional emails are mailed, customize copy, paste custom JSX/HTML templates, and preview live.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={loading}
            className="h-9 gap-1.5 text-xs font-medium cursor-pointer"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Total Automations</p>
            <Mail className="h-4 w-4 text-muted-foreground/60" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{totalCount}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">System notifications</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Sending (Active)
            </p>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {activeCount}
          </p>
          <p className="mt-0.5 text-[11px] text-emerald-600/80 dark:text-emerald-400/80">
            Delivering to inboxes
          </p>
        </div>

        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-rose-700 dark:text-rose-400">
              Muted (Suppressed)
            </p>
            <MailX className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-rose-700 dark:text-rose-300">
            {mutedCount}
          </p>
          <p className="mt-0.5 text-[11px] text-rose-600/80 dark:text-rose-400/80">
            Not being mailed
          </p>
        </div>

        <div className="rounded-2xl border border-[#38ABB1]/20 bg-[#38ABB1]/5 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[#38ABB1] dark:text-[#4cd1d7]">
              Custom Tailored
            </p>
            <PenTool className="h-4 w-4 text-[#38ABB1]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[#38ABB1] dark:text-[#4cd1d7]">
            {customizedCount}
          </p>
          <p className="mt-0.5 text-[11px] text-[#38ABB1]/80 dark:text-[#4cd1d7]/80">
            Custom copy / JSX active
          </p>
        </div>
      </div>

      {/* Master-Detail Two-Section Container (Feedback & Support Style) */}
      <div
        className={cn(
          "rounded-2xl border border-border bg-card overflow-hidden shadow-xs transition-all duration-200",
          isDesignerFullScreen && "fixed inset-0 z-50 rounded-none border-0 shadow-2xl"
        )}
      >
        {/* Category & Status Toolbar */}
        <div className="p-3 sm:p-4 border-b border-border bg-muted/20 flex flex-col gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-border/50">
            {Object.entries(CATEGORY_META).map(([catKey, meta]) => {
              const isSelected = selectedCategory === catKey;
              const count =
                catKey === "all"
                  ? templates.length
                  : templates.filter((t) => normalizeCategoryKey(t.category) === catKey).length;

              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setSelectedCategory(catKey)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span>{meta.label}</span>
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.2 text-[10px] font-semibold",
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-muted-foreground/15 text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}

            {customCategories.map((customCat) => {
              const isSelected = selectedCategory === customCat;
              const count = templates.filter(
                (t) => t.category.toLowerCase() === customCat.toLowerCase()
              ).length;
              return (
                <button
                  key={customCat}
                  type="button"
                  onClick={() => setSelectedCategory(customCat)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span>{customCat}</span>
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.2 text-[10px] font-semibold",
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-muted-foreground/15 text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input & Status Filter Pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-0.5">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search automations by title, keyword, or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl bg-background"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-muted-foreground mr-1">Status:</span>
              <div className="flex items-center gap-1 p-0.5 bg-background rounded-lg border border-border/60">
                {(
                  [
                    { id: "all", label: "All" },
                    { id: "active", label: "Active" },
                    { id: "muted", label: "Muted" },
                    { id: "customized", label: "Customized" },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStatusFilter(st.id)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer",
                      statusFilter === st.id
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Master-Detail Split Pane */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] min-h-[640px] h-[calc(100vh-270px)] min-h-[720px] divide-y lg:divide-y-0 lg:divide-x divide-border">
          {/* Left Column: Email Templates List */}
          <div className="overflow-y-auto divide-y divide-border/60 bg-muted/[0.08] custom-scrollbar flex flex-col">
            {loading && templates.length === 0 ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-28 rounded-xl bg-muted/40 animate-pulse border border-border/50" />
                ))}
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                  <MailX className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">No email automations match</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[220px] mx-auto">
                    Try adjusting your search query or switching categories.
                  </p>
                </div>
                {(searchQuery || statusFilter !== "all" || selectedCategory !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                      setSelectedCategory("all");
                    }}
                    className="h-8 text-xs cursor-pointer"
                  >
                    Reset Filters
                  </Button>
                )}
              </div>
            ) : (
              paginatedTemplates.map((tpl) => {
                const isSelected = editingTemplate?.key === tpl.key;
                const normKey = normalizeCategoryKey(tpl.category);
                const catMeta = CATEGORY_META[normKey] || {
                  label: tpl.category,
                  color: "text-primary",
                };

                return (
                  <div
                    key={tpl.key}
                    onClick={() => handleOpenDesigner(tpl)}
                    className={cn(
                      "group relative p-4 transition-all duration-150 cursor-pointer flex flex-col gap-2 hover:bg-muted/30 border-l-4",
                      isSelected
                        ? "bg-card border-l-primary dark:border-l-[#38ABB1] shadow-xs"
                        : "border-l-transparent bg-transparent"
                    )}
                  >
                    {/* Top Badges Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border",
                            tpl.isEnabled
                              ? "bg-primary/10 text-primary dark:text-[#38ABB1] border-primary/20 dark:border-[#38ABB1]/30"
                              : "bg-muted text-muted-foreground border-border"
                          )}
                        >
                          <span>{catMeta.label || tpl.category}</span>
                        </span>

                        {tpl.isCustomized && (
                          <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/25">
                            <Sparkles className="h-2.5 w-2.5" />
                            {tpl.isRawHtmlMode ? "Raw JSX" : "Custom"}
                          </span>
                        )}
                      </div>

                      <div
                        className="flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                            tpl.isEnabled
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                              : "bg-muted text-muted-foreground border-border"
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              tpl.isEnabled ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/50"
                            )}
                          />
                          {tpl.isEnabled ? "Active" : "Muted"}
                        </span>
                        <Switch
                          checked={tpl.isEnabled}
                          onCheckedChange={(checked) => handleToggleCard(tpl, checked)}
                          className="scale-75 origin-right"
                          aria-label={`Toggle ${tpl.name}`}
                        />
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h4
                        className={cn(
                          "text-sm font-bold tracking-tight transition-colors line-clamp-1",
                          isSelected
                            ? "text-primary dark:text-[#38ABB1]"
                            : "text-foreground group-hover:text-primary dark:group-hover:text-[#38ABB1]"
                        )}
                      >
                        {tpl.name}
                      </h4>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {tpl.description}
                      </p>
                    </div>

                    {/* Subject line preview */}
                    <div className="rounded-lg bg-muted/40 border border-border/60 px-2.5 py-1 text-[11px]">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Subject
                      </span>
                      <p className="font-medium text-foreground truncate">{tpl.activeSubject}</p>
                    </div>

                    {/* Footer info: Tokens & Quick Preview button */}
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                      <span className="truncate text-[10px]">
                        {tpl.availableTokens.length} dynamic variables
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFullScreenPreviewData({
                            title: tpl.name,
                            category: tpl.category,
                            subject: tpl.activeSubject,
                            html: getTemplatePreviewHtml(tpl),
                            isEnabled: tpl.isEnabled,
                            isCustomized: tpl.isCustomized,
                            templateKey: tpl.key,
                          });
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-primary dark:text-[#38ABB1] hover:underline cursor-pointer"
                      >
                        Quick Preview
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {totalPages > 1 && (
              <div className="p-2 border-t border-border/80 bg-card/60 shrink-0">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  total={filteredTemplates.length}
                  pageSize={pageSize}
                  label="templates"
                />
              </div>
            )}
          </div>

          {/* Right Column: Real-Time Interactive Template Designer Studio */}
          <div className="flex flex-col bg-background overflow-hidden min-h-0">
            {editingTemplate ? (
              <div className="flex flex-col h-full overflow-hidden">
                {/* Top Header Bar */}
            <div className="flex flex-wrap items-center justify-between border-b border-border px-5 py-3.5 bg-muted/20 shrink-0 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2 truncate">
                    <span className="truncate">{editingTemplate.name}</span>
                    {editingTemplate.isCustomized ? (
                      <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 border border-amber-500/30 shrink-0">
                        Customized
                      </span>
                    ) : (
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border shrink-0">
                        System Default
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate hidden sm:block">
                    Customize email copy, paste direct JSX/HTML templates, and preview live.
                  </p>
                </div>
              </div>

              {/* Right Header Actions */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {/* Delivery Switch */}
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-card border border-border">
                  <span className="text-xs font-semibold text-foreground hidden sm:inline">
                    {formIsEnabled ? "Delivery ON" : "MUTED"}
                  </span>
                  <Switch
                    checked={formIsEnabled}
                    onCheckedChange={setFormIsEnabled}
                    aria-label="Toggle email status"
                  />
                </div>

                {/* Reset to Default */}
                {editingTemplate.isCustomized && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resetTemplate({ variables: { templateKey: editingTemplate.key } })}
                    disabled={isResetting}
                    className="h-8 gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border-rose-500/30 cursor-pointer"
                  >
                    <RotateCcw className={cn("h-3 w-3", isResetting && "animate-spin")} />
                    <span className="hidden sm:inline">Reset</span>
                  </Button>
                )}

                {/* Open Full-Screen Preview */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFullScreenPreviewData({
                      title: editingTemplate.name,
                      category: editingTemplate.category,
                      subject: liveSubjectPreview,
                      html: livePreviewHtml,
                      isEnabled: formIsEnabled,
                      isCustomized: editingTemplate.isCustomized,
                      templateKey: editingTemplate.key,
                    });
                  }}
                  className="h-8 gap-1.5 text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10 cursor-pointer"
                  title="Open live email in full screen mode"
                >
                  <span className="hidden md:inline">Full Screen Preview</span>
                </Button>

                {/* Toggle Fullscreen Workspace */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDesignerFullScreen(!isDesignerFullScreen)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                  title={isDesignerFullScreen ? "Exit Fullscreen Workspace" : "Expand to Fullscreen Workspace"}
                >
                  {isDesignerFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>

                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingTemplate(null)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer rounded-lg"
                  title="Close Designer"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mode Switcher & View Layout Switcher Banner */}
            <div className="flex flex-wrap items-center justify-between border-b border-border px-5 py-2 bg-muted/40 shrink-0 gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-muted-foreground mr-1 hidden sm:inline">Editor Mode:</span>
                <button
                  type="button"
                  onClick={() => setEditorMode("builder")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer",
                    editorMode === "builder"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-background text-muted-foreground hover:bg-muted"
                  )}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Standard Builder
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode("raw_html")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer",
                    editorMode === "raw_html"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-background text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Code className="h-3.5 w-3.5" />
                  Direct JSX / Raw HTML Paste
                </button>
              </div>

              <div className="flex items-center gap-2">
                {editorMode === "raw_html" && (
                  <div className="flex items-center gap-1.5 mr-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const converted = convertJsxToHtml(formRawHtml);
                        setFormRawHtml(converted);
                        toast.success("Converted JSX attributes to standard email HTML");
                      }}
                      className="h-7 text-[11px] gap-1 cursor-pointer border-primary/30 text-primary hover:bg-primary/10"
                      title="Converts className to class, style={{...}} to inline styles, etc."
                    >
                      <Wand2 className="h-3 w-3" />
                      <span className="hidden sm:inline">Convert JSX to HTML</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(formRawHtml);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                        toast.success("Template code copied to clipboard");
                      }}
                      className="h-7 text-[11px] gap-1 cursor-pointer"
                    >
                      {copiedCode ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      <span className="hidden sm:inline">Copy Code</span>
                    </Button>
                  </div>
                )}

                {/* View Mode Switcher (Desktop): Split, Editor Only, Preview Only */}
                <div className="hidden lg:flex items-center rounded-lg border border-border bg-background p-0.5">
                  <button
                    type="button"
                    onClick={() => setDesignerViewMode("split")}
                    className={cn(
                      "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                      designerViewMode === "split"
                        ? "bg-primary/15 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    title="Side-by-side Editor and Live Preview"
                  >
                    <Columns2 className="h-3.5 w-3.5" />
                    Split
                  </button>
                  <button
                    type="button"
                    onClick={() => setDesignerViewMode("editor")}
                    className={cn(
                      "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                      designerViewMode === "editor"
                        ? "bg-primary/15 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    title="100% Editor Width"
                  >
                    <FileCode className="h-3.5 w-3.5" />
                    Editor Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setDesignerViewMode("preview")}
                    className={cn(
                      "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                      designerViewMode === "preview"
                        ? "bg-primary/15 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    title="100% Preview Width"
                  >
                    <Eye className="h-3.5 w-3.5"/>
                    Preview Only
                  </button>
                </div>

                {/* Mobile / Tablet Tab Switcher (when screen < lg) */}
                <div className="flex lg:hidden items-center rounded-lg border border-border bg-background p-0.5">
                  <button
                    type="button"
                    onClick={() => setMobileDesignerTab("editor")}
                    className={cn(
                      "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                      mobileDesignerTab === "editor"
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <FileCode className="h-3.5 w-3.5" />
                    Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileDesignerTab("preview")}
                    className={cn(
                      "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                      mobileDesignerTab === "preview"
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Preview
                  </button>
                </div>
              </div>
            </div>

            {/* Main Studio Body */}
            <div className="flex-1 overflow-hidden min-h-0 flex flex-col lg:flex-row">
              {/* LEFT COLUMN: EDITOR CONTROLS */}
              <div
                className={cn(
                  "overflow-y-auto p-5 sm:p-6 space-y-5 border-r border-border transition-all duration-200",
                  mobileDesignerTab !== "editor" && "hidden lg:block",
                  designerViewMode === "preview" && "lg:hidden",
                  designerViewMode === "editor" ? "w-full" : "lg:w-[50%] xl:w-[50%]"
                )}
              >
                {/* Dynamic Variables Palette */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                      Dynamic Variables (Click to Insert)
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Substituted per recipient
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {editingTemplate.availableTokens.map((token) => (
                      <button
                        key={token}
                        type="button"
                        onClick={() => handleInsertToken(token)}
                        title={`Insert {{${token}}}`}
                        className="inline-flex items-center gap-1 rounded-md bg-card px-2 py-1 text-[11px] font-mono font-medium text-foreground border border-border hover:border-primary hover:text-primary transition-colors cursor-pointer shadow-xs active:scale-95"
                      >
                        <Copy className="h-2.5 w-2.5 opacity-60" />
                        {`{{${token}}}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Classification Selector with 'Other' Option */}
                <div className="space-y-2 rounded-xl border border-border/80 bg-muted/20 p-3.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      Template Category
                    </label>
                    <span className="text-[10px] text-muted-foreground">Classification & filter folder</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                    <div>
                      <select
                        value={formCategoryChoice}
                        onChange={(e) => setFormCategoryChoice(e.target.value)}
                        className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
                      >
                        <option value="Leave Management">Leave Management</option>
                        <option value="Security & Access">Security & Access</option>
                        <option value="Attendance">Attendance</option>
                        <option value="Payroll & Finance">Payroll & Finance</option>
                        <option value="HR & Lifecycle">HR & Lifecycle</option>
                        <option value="General">General</option>
                        <option value="other">Other (Custom Category...)</option>
                      </select>
                    </div>

                    {formCategoryChoice === "other" && (
                      <div>
                        <Input
                          value={formCustomCategory}
                          onChange={(e) => setFormCustomCategory(e.target.value)}
                          placeholder="Specify custom category..."
                          className="h-9 text-xs rounded-xl font-medium bg-background"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Email Subject Line (Used in both modes) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Subject Line
                  </label>
                  <Input
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="Enter email subject..."
                    className="text-sm rounded-xl font-medium"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Supports tokens, e.g. <span className="font-mono text-primary">&#123;&#123;employee_name&#125;&#125;</span>
                  </p>
                </div>

                {/* MODE A: STANDARD BUILDER */}
                {editorMode === "builder" ? (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Card Headline
                      </label>
                      <Input
                        value={formHeadline}
                        onChange={(e) => setFormHeadline(e.target.value)}
                        placeholder="e.g. Leave Application Submitted"
                        className="text-sm rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Body Message
                      </label>
                      <Textarea
                        ref={bodyTextareaRef}
                        rows={7}
                        value={formBody}
                        onChange={(e) => setFormBody(e.target.value)}
                        placeholder="Enter notification message..."
                        className="text-sm leading-relaxed rounded-xl font-sans"
                      />
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                          Action Button (CTA)
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Leave blank to omit button
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-[11px] font-medium text-muted-foreground">Button Text</span>
                          <Input
                            value={formCtaText}
                            onChange={(e) => setFormCtaText(e.target.value)}
                            placeholder="e.g. Review Request"
                            className="text-xs rounded-lg"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[11px] font-medium text-muted-foreground">Button Link (URL)</span>
                          <Input
                            value={formCtaUrl}
                            onChange={(e) => setFormCtaUrl(e.target.value)}
                            placeholder="e.g. {{action_url}}"
                            className="text-xs rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Footer Note / Disclaimer
                      </label>
                      <Input
                        value={formFooter}
                        onChange={(e) => setFormFooter(e.target.value)}
                        placeholder="e.g. This is an automated email from Teamzen. Please do not reply."
                        className="text-xs rounded-xl"
                      />
                    </div>
                  </div>
                ) : (
                  /* MODE B: DIRECT JSX / RAW HTML PASTE */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <FileCode className="h-4 w-4 text-primary" />
                        Custom JSX / HTML Template Code
                      </label>
                      <span className="text-[11px] text-muted-foreground">
                        Paste complete email markup or React Email JSX
                      </span>
                    </div>

                    <Textarea
                      ref={rawHtmlTextareaRef}
                      rows={16}
                      value={formRawHtml}
                      onChange={(e) => setFormRawHtml(e.target.value)}
                      placeholder={`<!-- Paste your custom HTML or JSX email template code here -->\n<table width="100%" cellpadding="0" cellspacing="0">\n  <tr>\n    <td style="padding: 24px; font-family: sans-serif;">\n      <h2>Hello {{employee_name}},</h2>\n      <p>Your custom transactional notification message goes here.</p>\n    </td>\n  </tr>\n</table>`}
                      className="text-xs font-mono leading-relaxed rounded-xl bg-slate-950 text-slate-100 dark:bg-slate-900 border-slate-800 p-4 min-h-[340px]"
                      spellCheck={false}
                    />

                    <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs space-y-1 text-muted-foreground">
                      <p className="font-semibold text-foreground">Direct Paste Guidelines:</p>
                      <p>
                        • You can paste full <code className="text-primary font-mono">&lt;html&gt;</code> documents or modular HTML components.
                      </p>
                      <p>
                        • If pasting React / JSX markup, click <b className="text-foreground">Convert JSX to HTML</b> above to automatically normalize attributes.
                      </p>
                      <p>
                        • Insert any dynamic variable tokens from the chips palette above into your template code.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: REAL-TIME DUAL DEVICE PREVIEW */}
              <div
                className={cn(
                  "flex flex-col bg-slate-100 dark:bg-slate-950 overflow-hidden transition-all duration-200",
                  mobileDesignerTab !== "preview" && "hidden lg:flex",
                  designerViewMode === "editor" && "lg:hidden",
                  designerViewMode === "preview" ? "w-full" : "lg:w-[50%] xl:w-[50%]"
                )}
              >
                {/* Preview Top Toolbar */}
                <div className="flex items-center justify-between border-b border-border/80 bg-background px-4 py-2.5 shrink-0">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("desktop")}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors",
                        previewDevice === "desktop"
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <Monitor className="h-3.5 w-3.5" />
                      Desktop (600px)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("mobile")}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors",
                        previewDevice === "mobile"
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                      Mobile (375px)
                    </button>
                  </div>

                  {/* Prominent Full Screen Mode Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFullScreenPreviewData({
                        title: editingTemplate.name,
                        category: editingTemplate.category,
                        subject: liveSubjectPreview,
                        html: livePreviewHtml,
                        isEnabled: formIsEnabled,
                        isCustomized: editingTemplate.isCustomized,
                        templateKey: editingTemplate.key,
                      });
                    }}
                    className="h-7 px-2.5 gap-1.5 text-xs font-semibold cursor-pointer border-primary/30 text-primary hover:bg-primary/10"
                    title="Open in full screen mode for realistic client inspection"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    Open Full Screen Mode
                  </Button>
                </div>

                <div className="px-4 py-2 bg-muted/40 border-b border-border/60 text-xs shrink-0 flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-semibold text-muted-foreground shrink-0">Subject:</span>
                    <span className="font-medium text-foreground truncate">{liveSubjectPreview}</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex items-start justify-center">
                  <div
                    className={cn(
                      "w-full transition-all duration-300 rounded-xl overflow-hidden shadow-lg border border-slate-300 dark:border-slate-800 bg-white",
                      previewDevice === "desktop" ? "max-w-[600px]" : "max-w-[375px]"
                    )}
                  >
                    <iframe
                      srcDoc={livePreviewHtml}
                      title="Live Email Preview"
                      className="w-full h-[580px] sm:h-[620px] border-none bg-slate-50"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between border-t border-border px-5 py-3 bg-muted/10 shrink-0 gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* Field to enter mail id to send test mail */}
                <div className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-card p-1 shadow-xs">
                  <div className="relative flex items-center">
                    <Mail className="h-3.5 w-3.5 absolute left-2.5 text-muted-foreground pointer-events-none" />
                    <Input
                      type="email"
                      value={testEmailRecipient}
                      onChange={(e) => setTestEmailRecipient(e.target.value)}
                      placeholder="Enter email to send test..."
                      className="h-7 w-48 sm:w-64 pl-8 pr-2 text-xs rounded-lg border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-primary shadow-none"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!editingTemplate) return;
                      const emailToSend = (testEmailRecipient || user?.email || "").trim();
                      if (!emailToSend || !emailToSend.includes("@")) {
                        toast.error("Please enter a valid recipient email address");
                        return;
                      }
                      sendTestEmail({
                        variables: {
                          templateKey: editingTemplate.key,
                          recipientEmail: emailToSend,
                        },
                      });
                    }}
                    disabled={isSendingTest}
                    className="h-7 px-3 gap-1.5 text-xs font-medium cursor-pointer shrink-0"
                  >
                    {isSendingTest ? <Loader className="animate-spin" size={12}/> : <><Send className={cn("h-3 w-3")} /><span>Send Test</span></>}
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFullScreenPreviewData({
                      title: editingTemplate.name,
                      category: editingTemplate.category,
                      subject: liveSubjectPreview,
                      html: livePreviewHtml,
                      isEnabled: formIsEnabled,
                      isCustomized: editingTemplate.isCustomized,
                      templateKey: editingTemplate.key,
                    });
                  }}
                  className="h-9 gap-1.5 text-xs font-medium cursor-pointer hidden md:flex"
                >
                  Full Screen Preview
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (editingTemplate) handleOpenDesigner(editingTemplate);
                  }}
                  className="text-xs cursor-pointer"
                  title="Discard unsaved changes and reload template values"
                >
                  Revert Edits
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveTemplate}
                  disabled={isUpdating}
                  className="gap-1.5 text-xs font-medium cursor-pointer"
                >
                  Save Changes
                </Button>
              </div>
            </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-muted-foreground space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-muted/50 border border-border flex items-center justify-center text-primary dark:text-[#38ABB1]">
                  <Mail className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Select an Email Automation</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mt-1">
                    Choose a notification template from the left list to customize copy, dynamic variables, custom JSX/HTML, and preview live.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          DEDICATED FULL SCREEN LIVE EMAIL PREVIEW STUDIO OVERLAY
         ======================================================== */}
      {fullScreenPreviewData && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col text-slate-100 animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-4 sm:px-6 py-3 shrink-0 gap-3">
            {/* Left: Template info */}
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFullScreenPreviewData(null)}
                className="h-8 px-2.5 gap-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Close</span>
              </Button>
              <div className="h-4 w-[1px] bg-slate-700/60 hidden sm:block" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm sm:text-base text-white truncate">
                    {fullScreenPreviewData.title}
                  </span>
                  <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/30 shrink-0">
                    {CATEGORY_META[fullScreenPreviewData.category.toLowerCase()]?.label || fullScreenPreviewData.category}
                  </span>
                  {fullScreenPreviewData.isCustomized ? (
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/30 shrink-0 hidden md:inline">
                      Customized
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-400 border border-slate-700 shrink-0 hidden md:inline">
                      Default
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Center: Device Switcher */}
            <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950 p-1">
              <button
                type="button"
                onClick={() => setFullScreenDevice("desktop")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors",
                  fullScreenDevice === "desktop"
                    ? "bg-primary text-white shadow-xs font-semibold"
                    : "text-slate-400 hover:text-white"
                )}
                title="Desktop view (600px width)"
              >
                <Monitor className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Desktop</span>
                <span className="text-[10px] opacity-75 hidden lg:inline">(600px)</span>
              </button>
              <button
                type="button"
                onClick={() => setFullScreenDevice("laptop")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors",
                  fullScreenDevice === "laptop"
                    ? "bg-primary text-white shadow-xs font-semibold"
                    : "text-slate-400 hover:text-white"
                )}
                title="Wide view (800px width)"
              >
                <Laptop className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Wide</span>
                <span className="text-[10px] opacity-75 hidden lg:inline">(800px)</span>
              </button>
              <button
                type="button"
                onClick={() => setFullScreenDevice("tablet")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors",
                  fullScreenDevice === "tablet"
                    ? "bg-primary text-white shadow-xs font-semibold"
                    : "text-slate-400 hover:text-white"
                )}
                title="Tablet view (768px width)"
              >
                <Tablet className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Tablet</span>
                <span className="text-[10px] opacity-75 hidden lg:inline">(768px)</span>
              </button>
              <button
                type="button"
                onClick={() => setFullScreenDevice("mobile")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors",
                  fullScreenDevice === "mobile"
                    ? "bg-primary text-white shadow-xs font-semibold"
                    : "text-slate-400 hover:text-white"
                )}
                title="Mobile view (375px width)"
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Mobile</span>
                <span className="text-[10px] opacity-75 hidden lg:inline">(375px)</span>
              </button>
              <button
                type="button"
                onClick={() => setFullScreenDevice("fluid")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors",
                  fullScreenDevice === "fluid"
                    ? "bg-primary text-white shadow-xs font-semibold"
                    : "text-slate-400 hover:text-white"
                )}
                title="100% Fluid view"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Fluid</span>
              </button>
            </div>

            {/* Right: Theme simulation & Actions */}
            <div className="flex items-center gap-2">
              {/* Light / Dark canvas toggle */}
              <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-0.5">
                <button
                  type="button"
                  onClick={() => setFullScreenTheme("light")}
                  className={cn(
                    "p-1.5 rounded-md text-xs cursor-pointer transition-colors",
                    fullScreenTheme === "light" ? "bg-slate-800 text-amber-400" : "text-slate-500 hover:text-slate-300"
                  )}
                  title="Simulate Light Client Canvas"
                >
                  <Sun className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setFullScreenTheme("dark")}
                  className={cn(
                    "p-1.5 rounded-md text-xs cursor-pointer transition-colors",
                    fullScreenTheme === "dark" ? "bg-slate-800 text-sky-400" : "text-slate-500 hover:text-slate-300"
                  )}
                  title="Simulate Dark Client Canvas"
                >
                  <Moon className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Field to enter mail id to send test mail directly */}
              <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2 py-0.5">
                <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                <input
                  type="email"
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  placeholder="Recipient for test..."
                  className="h-7 w-32 sm:w-48 bg-transparent text-xs text-white placeholder:text-slate-500 border-0 focus:outline-none"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    if (!fullScreenPreviewData) return;
                    const emailToSend = (testEmailRecipient || user?.email || "").trim();
                    if (!emailToSend || !emailToSend.includes("@")) {
                      toast.error("Please enter a valid recipient email address");
                      return;
                    }
                    sendTestEmail({
                      variables: {
                        templateKey: fullScreenPreviewData.templateKey,
                        recipientEmail: emailToSend,
                      },
                    });
                  }}
                  disabled={isSendingTest}
                  className="h-6 px-2.5 gap-1 text-[11px] font-semibold cursor-pointer shrink-0"
                >
                  {isSendingTest ? <Loader className="animate-spin" size={12}/> : <><Send className={cn("h-3 w-3")} /><span>Send Test</span></>}
                </Button>
              </div>

              {/* If opened from list and not currently in editor, allow opening designer directly */}
              {!editingTemplate && (
                <Button
                  size="sm"
                  onClick={() => {
                    const tpl = templates.find((t) => t.key === fullScreenPreviewData.templateKey);
                    if (tpl) {
                      setFullScreenPreviewData(null);
                      handleOpenDesigner(tpl);
                    }
                  }}
                  className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Customize</span>
                </Button>
              )}

              <button
                type="button"
                onClick={() => setFullScreenPreviewData(null)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                title="Exit Full Screen (Esc)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Simulated Client Header Bar */}
          <div className="bg-slate-900/60 border-b border-slate-800/60 px-6 py-2.5 text-xs text-slate-300 shrink-0">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-slate-400 shrink-0">Subject:</span>
                <span className="font-medium text-white truncate">{fullScreenPreviewData.subject}</span>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-400 shrink-0">
                <span>From: <strong className="text-slate-300">Teamzen System</strong> &lt;noreply@teamzen.internal&gt;</span>
                <span className="hidden md:inline">To: <strong className="text-slate-300">Recipient (Sample)</strong></span>
              </div>
            </div>
          </div>

          {/* Canvas Content Area */}
          <div
            className={cn(
              "flex-1 overflow-y-auto p-4 sm:p-8 flex items-start justify-center transition-colors duration-200",
              fullScreenTheme === "light" ? "bg-slate-950/80" : "bg-black"
            )}
          >
            <div
              className={cn(
                "w-full transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl border bg-white",
                fullScreenTheme === "light" ? "border-slate-800 shadow-slate-950/50" : "border-slate-800/80 shadow-black",
                fullScreenDevice === "desktop" && "max-w-[620px]",
                fullScreenDevice === "laptop" && "max-w-[800px]",
                fullScreenDevice === "tablet" && "max-w-[768px]",
                fullScreenDevice === "mobile" && "max-w-[390px]",
                fullScreenDevice === "fluid" && "max-w-5xl"
              )}
            >
              <iframe
                srcDoc={fullScreenPreviewData.html}
                title="Full Screen Live Email Preview"
                className="w-full h-[calc(100vh-170px)] min-h-[640px] border-none bg-white"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      )}

      {/* Test Email Modal */}
      {testEmailModalOpen && (
        <Dialog open={testEmailModalOpen} onOpenChange={setTestEmailModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Send className="h-4 w-4 text-primary" />
                Send Live Test Email
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Dispatch a rendered preview of this email with sample tokens directly to an inbox to verify formatting and deliverability.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Recipient Email Address
                </label>
                <Input
                  type="email"
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  placeholder="name@example.com"
                  className="text-sm rounded-xl"
                />
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-[11px] text-muted-foreground space-y-1">
                <p className="font-semibold text-primary">Live Delivery:</p>
                <p>
                  Delivered via your configured transactional Brevo/SMTP pipeline with sample values substituted into all variables.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTestEmailModalOpen(false)}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (!testTemplateKey || !testEmailRecipient) {
                    toast.error("Please enter a valid recipient email");
                    return;
                  }
                  sendTestEmail({
                    variables: {
                      templateKey: testTemplateKey,
                      recipientEmail: testEmailRecipient,
                    },
                  });
                }}
                disabled={isSendingTest}
                className="gap-1.5 text-xs font-medium cursor-pointer"
              >
                {isSendingTest ? <Loader className="animate-spin" size={12}/> : <><Send className={cn("h-3.5 w-3.5")} /><span>Send Test</span></>}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
