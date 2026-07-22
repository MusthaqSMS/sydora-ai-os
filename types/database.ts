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

export interface Profile extends TimestampedRecord {
  id: EntityId;
  full_name: string | null;
  avatar_url: string | null;
  timezone: string;
  phone: string | null;
  designation: string | null;
  department: string | null;
  skills: string[];
  bio: string | null;
  language: string;
  notification_preferences: Json;
  active_organization_id: EntityId | null;
  is_super_admin: boolean;
}

export interface Organization extends TimestampedRecord {
  name: string;
  slug: string;
  industry: string | null;
  website: string | null;
  timezone: string;
  country: string | null;
  currency: string;
  business_goals: string[];
  logo_path: string | null;
  primary_color: string;
  onboarding_step: number;
  onboarding_completed_at: string | null;
}

export interface Role extends TenantRecord {
  name: string;
  description: string | null;
  role_key: string | null;
  is_system: boolean;
}

export interface Permission extends TimestampedRecord {
  key: string;
  description: string | null;
}

export interface OrganizationMember extends TenantRecord {
  user_id: EntityId;
  role_id: EntityId | null;
  member_role: "owner" | "admin" | "member" | "viewer";
  status: "active" | "inactive";
  invited_by: EntityId | null;
  deactivated_at: string | null;
  deactivated_by: EntityId | null;
}

export interface OrganizationInvitation extends TenantRecord {
  email: string;
  role_id: EntityId;
  token_hash: string;
  status: "pending" | "accepted" | "cancelled" | "expired";
  expires_at: string;
  accepted_at: string | null;
  accepted_by: EntityId | null;
  invited_by: EntityId | null;
  metadata: Json;
}

export interface SecurityEvent extends TimestampedRecord {
  organization_id: EntityId | null;
  user_id: EntityId | null;
  email: string | null;
  event_type: "login_failed" | "login_succeeded" | "logout" | "password_reset_requested" | "password_changed" | "email_update_requested" | "email_updated" | "session_timeout" | "permission_denied" | "invitation_sent" | "invitation_accepted";
  success: boolean;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Json;
}

type Insert<T extends TimestampedRecord> = Omit<T, "id" | "created_at" | "updated_at" | "created_by" | "deleted_at"> & Partial<Pick<T, "id" | "created_at" | "updated_at" | "created_by" | "deleted_at">>;
type Update<T extends TimestampedRecord> = Partial<Omit<T, "id" | "organization_id" | "created_at" | "created_by">>;
type DatabaseTable<T extends TenantRecord> = { Row: T & Record<string, unknown>; Insert: Insert<T> & Record<string, unknown>; Update: Update<T> & Record<string, unknown>; Relationships: [] };
type PlainTable<T extends TimestampedRecord> = { Row: T & Record<string, unknown>; Insert: Insert<T> & Record<string, unknown>; Update: Partial<Omit<T, "id" | "created_at" | "created_by">> & Record<string, unknown>; Relationships: [] };
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
      profiles: PlainTable<Profile>;
      organizations: PlainTable<Organization>;
      organization_members: DatabaseTable<OrganizationMember>;
      roles: DatabaseTable<Role>;
      role_permissions: GenericTable;
      permissions: PlainTable<Permission>;
      organization_invitations: DatabaseTable<OrganizationInvitation>;
      security_events: PlainTable<SecurityEvent>;
      rate_limit_buckets: GenericTable;
      client_contacts: GenericTable; lead_sources: GenericTable; lead_statuses: GenericTable; lead_notes: GenericTable; lead_activities: GenericTable; task_comments: GenericTable; calendar_events: GenericTable; invoices: GenericTable; payments: GenericTable; quotes: GenericTable; documents: GenericTable; google_ads_campaigns: GenericTable; meta_campaigns: GenericTable; seo_keywords: GenericTable; keyword_rankings: GenericTable; backlinks: GenericTable; competitors: GenericTable; website_audits: GenericTable; ai_generations: GenericTable; prompt_library: GenericTable; knowledge_base: GenericTable; notifications: GenericTable; activity_logs: GenericTable; integrations: GenericTable; api_keys: GenericTable; settings: GenericTable; usage_tracking: GenericTable; subscription_plans: GenericTable;
    };
    Views: Record<string, never>;
    Functions: {
      create_organization: { Args: { p_name: string; p_slug: string }; Returns: Organization };
      has_permission: { Args: { p_organization_id: string; p_permission_key: string }; Returns: boolean };
      create_invitation: { Args: { p_organization_id: string; p_email: string; p_role_id: string; p_token_hash: string }; Returns: OrganizationInvitation };
      accept_invitation: { Args: { p_token_hash: string }; Returns: OrganizationMember };
      update_member_status: { Args: { p_member_id: string; p_status: "active" | "inactive" }; Returns: OrganizationMember };
      check_rate_limit: { Args: { p_bucket_key: string; p_limit: number; p_window_seconds: number }; Returns: boolean };
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
