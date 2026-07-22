export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type EntityId = string;

export interface TimestampedRecord {
  id: EntityId;
  created_at: string;
  updated_at: string;
  created_by: EntityId | null;
  deleted_at: string | null;
}

export interface TenantRecord extends TimestampedRecord {
  organization_id: EntityId;
}

export interface Client extends TenantRecord {
  name: string;
  website: string | null;
  industry: string | null;
  lifecycle_status: "active" | "inactive" | "archived";
}

export interface Lead extends TenantRecord {
  client_id: EntityId | null;
  source_id: EntityId | null;
  status_id: EntityId | null;
  name: string;
  email: string | null;
  company: string | null;
  estimated_value: number | null;
}

export interface Project extends TenantRecord {
  client_id: EntityId;
  name: string;
  status: "planned" | "active" | "on_hold" | "completed" | "cancelled";
  start_date: string | null;
  due_date: string | null;
}

export interface Task extends TenantRecord {
  project_id: EntityId | null;
  assignee_id: EntityId | null;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "blocked" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  due_at: string | null;
}

export interface MarketingCampaign extends TenantRecord {
  client_id: EntityId;
  name: string;
  channel: "email" | "search" | "social" | "content" | "other";
  status: "draft" | "active" | "paused" | "completed";
  starts_at: string | null;
  ends_at: string | null;
}

export interface SeoProject extends TenantRecord {
  client_id: EntityId;
  project_id: EntityId | null;
  website_url: string;
  status: "planned" | "active" | "on_hold" | "completed" | "cancelled";
}

type Insert<T extends TimestampedRecord> = Omit<T, "id" | "created_at" | "updated_at" | "created_by" | "deleted_at"> & Partial<Pick<T, "id" | "created_at" | "updated_at" | "created_by" | "deleted_at">>;
type Update<T extends TimestampedRecord> = Partial<Omit<T, "id" | "organization_id" | "created_at" | "created_by">>;
type DatabaseTable<T extends TenantRecord> = { Row: T & Record<string, unknown>; Insert: Insert<T> & Record<string, unknown>; Update: Update<T> & Record<string, unknown>; Relationships: [] };
type GenericTable = DatabaseTable<TenantRecord>;

export interface Database {
  public: {
    Tables: {
      clients: DatabaseTable<Client>;
      leads: DatabaseTable<Lead>;
      projects: DatabaseTable<Project>;
      tasks: DatabaseTable<Task>;
      marketing_campaigns: DatabaseTable<MarketingCampaign>;
      seo_projects: DatabaseTable<SeoProject>;
      profiles: GenericTable; organizations: GenericTable; organization_members: GenericTable; roles: GenericTable; permissions: GenericTable; client_contacts: GenericTable; lead_sources: GenericTable; lead_statuses: GenericTable; lead_notes: GenericTable; lead_activities: GenericTable; task_comments: GenericTable; calendar_events: GenericTable; invoices: GenericTable; payments: GenericTable; quotes: GenericTable; documents: GenericTable; google_ads_campaigns: GenericTable; meta_campaigns: GenericTable; seo_keywords: GenericTable; keyword_rankings: GenericTable; backlinks: GenericTable; competitors: GenericTable; website_audits: GenericTable; ai_generations: GenericTable; prompt_library: GenericTable; knowledge_base: GenericTable; notifications: GenericTable; activity_logs: GenericTable; integrations: GenericTable; api_keys: GenericTable; settings: GenericTable; usage_tracking: GenericTable; subscription_plans: GenericTable;
    };
    Views: Record<string, never>;
    Functions: {
      create_organization: { Args: { p_name: string; p_slug: string }; Returns: { id: string; name: string; slug: string; created_at: string; updated_at: string; created_by: string; deleted_at: string | null } };
      create_client: { Args: { p_organization_id: string; p_name: string; p_website?: string | null; p_industry?: string | null }; Returns: Client };
      update_client: { Args: { p_client_id: string; p_name?: string | null; p_website?: string | null; p_industry?: string | null; p_lifecycle_status?: string | null }; Returns: Client };
      delete_client: { Args: { p_client_id: string }; Returns: undefined };
      create_lead: { Args: { p_organization_id: string; p_name: string; p_email?: string | null; p_company?: string | null; p_source_id?: string | null; p_status_id?: string | null; p_estimated_value?: number | null }; Returns: Lead };
      update_lead: { Args: { p_lead_id: string; p_name?: string | null; p_email?: string | null; p_company?: string | null; p_source_id?: string | null; p_status_id?: string | null; p_estimated_value?: number | null }; Returns: Lead };
      create_task: { Args: { p_organization_id: string; p_title: string; p_project_id?: string | null; p_assignee_id?: string | null; p_description?: string | null; p_priority?: string | null; p_due_at?: string | null }; Returns: Task };
      log_activity: { Args: { p_organization_id: string; p_action: string; p_entity_type: string; p_entity_id?: string | null; p_metadata?: Json }; Returns: string };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
