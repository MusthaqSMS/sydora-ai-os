export const permissionModules = [
  "clients",
  "leads",
  "projects",
  "tasks",
  "calendar",
  "seo",
  "campaigns",
  "reports",
  "invoices",
  "billing",
  "documents",
  "data",
  "search",
  "ads",
  "agency",
  "notifications",
  "integrations",
  "settings",
  "users",
  "roles",
  "ai_features",
] as const;

export const permissionActions = ["view", "create", "update", "delete", "export", "import", "approve", "assign"] as const;

export const systemRoles = [
  { key: "owner", name: "Owner", description: "Full organization ownership and billing control." },
  { key: "admin", name: "Admin", description: "Administrative access across the workspace." },
  { key: "manager", name: "Manager", description: "Operational control across clients, work, and reports." },
  { key: "marketing_manager", name: "Marketing Manager", description: "Campaign, lead, reporting, and AI work." },
  { key: "seo_specialist", name: "SEO Specialist", description: "SEO projects, keywords, reporting, and related tasks." },
  { key: "content_writer", name: "Content Writer", description: "Content tasks, SEO support, and AI drafting." },
  { key: "sales_manager", name: "Sales Manager", description: "Lead, client, sales task, and reporting management." },
  { key: "sales_executive", name: "Sales Executive", description: "Lead and client execution access." },
  { key: "support_agent", name: "Support Agent", description: "Client support and assigned task access." },
  { key: "viewer", name: "Viewer", description: "Read-only workspace access." },
] as const;

export type PermissionModule = (typeof permissionModules)[number];
export type PermissionAction = (typeof permissionActions)[number];
export type PermissionKey = `${PermissionModule}.${PermissionAction}` | "users.invite" | "users.deactivate" | "users.reactivate" | "organizations.view" | "organizations.update" | "organizations.delete" | "profile.update";
export type SystemRoleKey = (typeof systemRoles)[number]["key"];
