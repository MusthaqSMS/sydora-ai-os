export type EnterpriseModuleSlug =
  | "projects"
  | "tasks"
  | "calendar"
  | "documents"
  | "import-export"
  | "search"
  | "reports"
  | "marketing"
  | "seo"
  | "advertising"
  | "ai-studio"
  | "finance"
  | "client-portal"
  | "agency-portal"
  | "notifications"
  | "integrations"
  | "platform-settings";

export type EnterpriseField =
  | { name: string; label: string; type: "text" | "url" | "number" | "date" | "datetime-local"; required?: boolean; placeholder?: string }
  | { name: string; label: string; type: "select"; required?: boolean; options: readonly { label: string; value: string }[] };

export type EnterpriseModule = {
  slug: EnterpriseModuleSlug;
  title: string;
  summary: string;
  table: string | null;
  permission: PermissionKey;
  primaryMetric: string;
  createLabel?: string;
  fields: readonly EnterpriseField[];
  capabilities: readonly string[];
};

const projectStatus = [
  { label: "Planned", value: "planned" },
  { label: "Active", value: "active" },
  { label: "On hold", value: "on_hold" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
] as const;

const taskPriority = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
] as const;

const campaignChannel = [
  { label: "Email", value: "email" },
  { label: "Search", value: "search" },
  { label: "Social", value: "social" },
  { label: "Content", value: "content" },
  { label: "Other", value: "other" },
] as const;

const campaignStatus = [
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Completed", value: "completed" },
] as const;

const integrationProviders = [
  { label: "Google Analytics", value: "google_analytics" },
  { label: "Google Ads", value: "google_ads" },
  { label: "Search Console", value: "google_search_console" },
  { label: "Google Business Profile", value: "google_business_profile" },
  { label: "Meta", value: "meta" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "YouTube", value: "youtube" },
  { label: "OpenAI", value: "openai" },
  { label: "Gemini", value: "gemini" },
  { label: "Stripe", value: "stripe" },
  { label: "Razorpay", value: "razorpay" },
  { label: "Slack", value: "slack" },
  { label: "Discord", value: "discord" },
  { label: "Zapier", value: "zapier" },
  { label: "Make", value: "make" },
  { label: "SMTP", value: "smtp" },
  { label: "WhatsApp Cloud API", value: "whatsapp_cloud_api" },
] as const;

export const enterpriseModules: readonly EnterpriseModule[] = [
  {
    slug: "projects",
    title: "Project Management",
    summary: "Track client delivery with members, timelines, milestones, budgets, files, progress, health, activity, and reports.",
    table: "projects",
    permission: "projects.view",
    primaryMetric: "Active projects",
    createLabel: "Create project",
    fields: [
      { name: "clientId", label: "Client ID", type: "text", required: true, placeholder: "Existing client UUID" },
      { name: "name", label: "Project name", type: "text", required: true },
      { name: "status", label: "Status", type: "select", options: projectStatus },
      { name: "startDate", label: "Start date", type: "date" },
      { name: "dueDate", label: "Due date", type: "date" },
    ],
    capabilities: ["CRUD", "Members", "Timeline", "Milestones", "Files", "Budget", "Progress", "Health", "Activity", "Reports"],
  },
  {
    slug: "tasks",
    title: "Task Management",
    summary: "Manage enterprise work with subtasks, dependencies, labels, priority, comments, attachments, time tracking, recurrence, workload, and templates.",
    table: "tasks",
    permission: "tasks.view",
    primaryMetric: "Open tasks",
    createLabel: "Create task",
    fields: [
      { name: "title", label: "Task title", type: "text", required: true },
      { name: "projectId", label: "Project ID", type: "text", placeholder: "Optional project UUID" },
      { name: "description", label: "Description", type: "text" },
      { name: "priority", label: "Priority", type: "select", options: taskPriority },
      { name: "dueAt", label: "Due at", type: "datetime-local" },
    ],
    capabilities: ["CRUD", "Subtasks", "Dependencies", "Labels", "Priority", "Mentions", "Comments", "Attachments", "Time Tracking", "Recurring Tasks", "Workload", "Task Templates"],
  },
  {
    slug: "calendar",
    title: "Calendar",
    summary: "Schedule day, week, month, and agenda events across meetings, calls, tasks, deadlines, recurring events, and realtime updates.",
    table: "calendar_events",
    permission: "calendar.view",
    primaryMetric: "Upcoming events",
    createLabel: "Schedule event",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "clientId", label: "Client ID", type: "text", placeholder: "Optional client UUID" },
      { name: "projectId", label: "Project ID", type: "text", placeholder: "Optional project UUID" },
      { name: "startsAt", label: "Starts at", type: "datetime-local", required: true },
      { name: "endsAt", label: "Ends at", type: "datetime-local", required: true },
    ],
    capabilities: ["Day", "Week", "Month", "Agenda", "Meetings", "Calls", "Tasks", "Deadlines", "Recurring Events", "Realtime"],
  },
  {
    slug: "documents",
    title: "Document Management",
    summary: "Organize client and project files with metadata, categories, folders, version history, contracts, reports, images, and PDFs.",
    table: "documents",
    permission: "documents.view",
    primaryMetric: "Documents",
    createLabel: "Register document",
    fields: [
      { name: "name", label: "Document name", type: "text", required: true },
      { name: "storagePath", label: "Storage path", type: "text", required: true, placeholder: "contracts/acme/proposal.pdf" },
      { name: "clientId", label: "Client ID", type: "text", placeholder: "Optional client UUID" },
      { name: "projectId", label: "Project ID", type: "text", placeholder: "Optional project UUID" },
      { name: "mimeType", label: "MIME type", type: "text", placeholder: "application/pdf" },
    ],
    capabilities: ["Upload Metadata", "Download Links", "Preview Metadata", "Delete", "Categories", "Folders", "Version History", "Contracts", "Reports", "Images", "PDFs"],
  },
  {
    slug: "import-export",
    title: "Import / Export",
    summary: "Coordinate CSV, Excel, duplicate detection, field mapping, bulk import, and CSV, Excel, and PDF exports.",
    table: "activity_logs",
    permission: "data.view",
    primaryMetric: "Import events",
    fields: [],
    capabilities: ["CSV Import", "Excel Import", "Duplicate Detection", "Field Mapping", "Bulk Import", "CSV Export", "Excel Export", "PDF Export"],
  },
  {
    slug: "search",
    title: "Global Search",
    summary: "Universal search across clients, contacts, leads, projects, tasks, documents, invoices, campaigns, SEO, and AI content.",
    table: null,
    permission: "search.view",
    primaryMetric: "Searchable records",
    fields: [],
    capabilities: ["Clients", "Contacts", "Leads", "Projects", "Tasks", "Documents", "Invoices", "Campaigns", "SEO", "AI Content"],
  },
  {
    slug: "reports",
    title: "Reports & Analytics",
    summary: "Executive reporting for CRM, leads, pipeline, revenue, projects, tasks, charts, KPIs, filters, and exports.",
    table: "activity_logs",
    permission: "reports.view",
    primaryMetric: "Tracked events",
    fields: [],
    capabilities: ["CRM Dashboard", "Lead Dashboard", "Pipeline Dashboard", "Revenue Dashboard", "Project Dashboard", "Task Dashboard", "Executive Dashboard", "Charts", "KPIs", "Exports"],
  },
  {
    slug: "marketing",
    title: "Marketing Automation",
    summary: "Build enterprise campaigns, email and WhatsApp marketing, triggers, conditions, workflows, templates, reporting, and ROI dashboards.",
    table: "marketing_campaigns",
    permission: "campaigns.view",
    primaryMetric: "Campaigns",
    createLabel: "Create campaign",
    fields: [
      { name: "clientId", label: "Client ID", type: "text", required: true, placeholder: "Existing client UUID" },
      { name: "name", label: "Campaign name", type: "text", required: true },
      { name: "channel", label: "Channel", type: "select", options: campaignChannel },
      { name: "status", label: "Status", type: "select", options: campaignStatus },
      { name: "budget", label: "Budget", type: "number" },
    ],
    capabilities: ["Campaign Builder", "Email Marketing", "WhatsApp Marketing", "Automation Builder", "Trigger Engine", "Conditions", "Workflow Builder", "Templates", "Reports", "ROI Dashboard"],
  },
  {
    slug: "seo",
    title: "SEO Platform",
    summary: "Manage website audits, technical SEO, keyword tracking, competitors, backlinks, internal links, schema, content optimization, GEO, AEO, and AI SEO suggestions.",
    table: "seo_projects",
    permission: "seo.view",
    primaryMetric: "SEO projects",
    createLabel: "Create SEO project",
    fields: [
      { name: "clientId", label: "Client ID", type: "text", required: true, placeholder: "Existing client UUID" },
      { name: "websiteUrl", label: "Website URL", type: "url", required: true },
      { name: "projectId", label: "Delivery project ID", type: "text", placeholder: "Optional project UUID" },
      { name: "status", label: "Status", type: "select", options: projectStatus },
    ],
    capabilities: ["Website Audit", "Technical SEO", "On-page SEO", "Off-page SEO", "Keyword Research", "Keyword Tracking", "Competitor Analysis", "Backlinks", "Schema Generator", "Content Optimizer", "Reports", "Core Web Vitals", "GEO", "AEO"],
  },
  {
    slug: "advertising",
    title: "Paid Advertising",
    summary: "Monitor Google Ads, Meta Ads, LinkedIn Ads, YouTube Ads, campaign budgets, ROAS, CPA, CPC, CTR, and conversion tracking.",
    table: "marketing_campaigns",
    permission: "ads.view",
    primaryMetric: "Paid campaigns",
    fields: [],
    capabilities: ["Google Ads", "Meta Ads", "LinkedIn Ads", "YouTube Ads", "Campaign Dashboard", "Budget Tracking", "ROAS", "CPA", "CPC", "CTR", "Conversion Tracking"],
  },
  {
    slug: "ai-studio",
    title: "AI Studio",
    summary: "Enterprise AI workspace for chat, content, blogs, social, proposals, landing pages, website analysis, marketing strategy, SEO writing, prompts, agents, and workflows.",
    table: "prompt_library",
    permission: "ai_features.view",
    primaryMetric: "Prompts",
    createLabel: "Create prompt",
    fields: [
      { name: "name", label: "Prompt name", type: "text", required: true },
      { name: "category", label: "Category", type: "text" },
      { name: "template", label: "Template", type: "text", required: true },
    ],
    capabilities: ["AI Chat", "AI Content Writer", "Blog Generator", "Social Generator", "Proposal Generator", "Landing Page Generator", "Website Analyzer", "Strategy Generator", "SEO Writer", "Prompt Library", "Custom AI Agents", "AI Workflow Builder"],
  },
  {
    slug: "finance",
    title: "Finance",
    summary: "Manage quotes, invoices, payments, expenses, revenue, subscription plans, and billing dashboards.",
    table: "invoices",
    permission: "invoices.view",
    primaryMetric: "Invoices",
    createLabel: "Create invoice",
    fields: [
      { name: "clientId", label: "Client ID", type: "text", required: true, placeholder: "Existing client UUID" },
      { name: "invoiceNumber", label: "Invoice number", type: "text", required: true },
      { name: "total", label: "Total", type: "number" },
      { name: "dueDate", label: "Due date", type: "date" },
    ],
    capabilities: ["Quotes", "Invoices", "Payments", "Expenses", "Revenue", "Subscription Plans", "Billing Dashboard"],
  },
  {
    slug: "client-portal",
    title: "Client Portal",
    summary: "Client-facing workspace for dashboards, projects, campaigns, SEO reports, invoices, payments, uploads, approvals, and support tickets.",
    table: "clients",
    permission: "clients.view",
    primaryMetric: "Portal clients",
    fields: [],
    capabilities: ["Client Login", "Dashboard", "Projects", "Campaigns", "SEO Reports", "Invoices", "Payments", "File Upload", "Approvals", "Support Tickets"],
  },
  {
    slug: "agency-portal",
    title: "Agency Portal",
    summary: "Internal agency operations for employee dashboards, attendance, leave, performance, KPIs, announcements, and knowledge base.",
    table: "knowledge_base",
    permission: "agency.view",
    primaryMetric: "Knowledge items",
    createLabel: "Publish knowledge item",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "content", label: "Content", type: "text", required: true },
      { name: "sourceUrl", label: "Source URL", type: "url" },
    ],
    capabilities: ["Employee Dashboard", "Attendance", "Leave Management", "Performance", "KPI Dashboard", "Internal Announcements", "Knowledge Base"],
  },
  {
    slug: "notifications",
    title: "Notifications",
    summary: "Send and track in-app notifications, email notification intent, reminders, activity alerts, and realtime notifications.",
    table: "notifications",
    permission: "notifications.view",
    primaryMetric: "Notifications",
    createLabel: "Create notification",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "body", label: "Body", type: "text" },
      { name: "userId", label: "User ID", type: "text", required: true, placeholder: "Recipient user UUID" },
    ],
    capabilities: ["In-App Notifications", "Email Notifications", "Reminder Center", "Activity Alerts", "Realtime Notifications"],
  },
  {
    slug: "integrations",
    title: "Integrations",
    summary: "Configure integration extension points and validation for analytics, ad networks, AI providers, payments, messaging, automation, SMTP, and WhatsApp.",
    table: "integrations",
    permission: "integrations.view",
    primaryMetric: "Integrations",
    createLabel: "Configure integration",
    fields: [
      { name: "provider", label: "Provider", type: "select", required: true, options: integrationProviders },
      { name: "status", label: "Status", type: "select", options: [{ label: "Disconnected", value: "disconnected" }, { label: "Connected", value: "connected" }, { label: "Error", value: "error" }] },
      { name: "configurationNote", label: "Configuration note", type: "text", placeholder: "No secrets; describe environment variable or OAuth app setup." },
    ],
    capabilities: integrationProviders.map((item) => item.label),
  },
  {
    slug: "platform-settings",
    title: "Enterprise Settings",
    summary: "Control organization, branding, domains, API keys, billing, roles, permissions, email, storage, audit, and security settings.",
    table: "settings",
    permission: "settings.view",
    primaryMetric: "Settings",
    createLabel: "Save setting",
    fields: [
      { name: "key", label: "Setting key", type: "text", required: true, placeholder: "branding.primary" },
      { name: "value", label: "Value", type: "text", required: true, placeholder: "Stored as JSON string metadata" },
    ],
    capabilities: ["Organization", "Branding", "Domains", "API Keys", "Billing", "Roles", "Permissions", "Email", "Storage", "Audit", "Security"],
  },
] as const;

export function getEnterpriseModule(slug: string): EnterpriseModule | undefined {
  return enterpriseModules.find((module) => module.slug === slug);
}
import type { PermissionKey } from "@/lib/constants/rbac";
