create type public.organization_member_status as enum ('active', 'inactive');
create type public.invitation_status as enum ('pending', 'accepted', 'cancelled', 'expired');
create type public.security_event_type as enum ('login_failed', 'login_succeeded', 'logout', 'password_reset_requested', 'password_changed', 'email_update_requested', 'email_updated', 'session_timeout', 'permission_denied', 'invitation_sent', 'invitation_accepted');

alter table public.profiles
  add column if not exists phone text,
  add column if not exists designation text,
  add column if not exists department text,
  add column if not exists skills text[] not null default '{}',
  add column if not exists bio text,
  add column if not exists language text not null default 'en',
  add column if not exists notification_preferences jsonb not null default '{"email":true,"in_app":true,"marketing":false}'::jsonb,
  add column if not exists active_organization_id uuid references public.organizations(id) on delete set null,
  add column if not exists is_super_admin boolean not null default false;

alter table public.organizations
  add column if not exists industry text,
  add column if not exists website text,
  add column if not exists timezone text not null default 'UTC',
  add column if not exists country text,
  add column if not exists currency text not null default 'USD',
  add column if not exists business_goals text[] not null default '{}',
  add column if not exists logo_path text,
  add column if not exists primary_color text not null default '#111827',
  add column if not exists onboarding_step integer not null default 1,
  add column if not exists onboarding_completed_at timestamptz,
  add constraint organizations_primary_color_format check (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  add constraint organizations_onboarding_step_range check (onboarding_step between 1 and 4);

alter table public.roles
  add column if not exists role_key text,
  add column if not exists is_system boolean not null default false;

create unique index if not exists roles_organization_role_key_idx on public.roles(organization_id, role_key) where deleted_at is null and role_key is not null;

alter table public.organization_members
  add column if not exists status public.organization_member_status not null default 'active',
  add column if not exists deactivated_at timestamptz,
  add column if not exists deactivated_by uuid references auth.users(id) on delete set null,
  add column if not exists invited_by uuid references auth.users(id) on delete set null;

create table if not exists public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role_id uuid not null references public.roles(id) on delete restrict,
  token_hash text not null unique,
  status public.invitation_status not null default 'pending',
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_at timestamptz,
  accepted_by uuid references auth.users(id) on delete set null,
  invited_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  constraint organization_invitations_email_format check (email = lower(email) and position('@' in email) > 1)
);

create unique index if not exists organization_invitations_pending_email_idx
  on public.organization_invitations(organization_id, email)
  where deleted_at is null and status = 'pending';
create index if not exists organization_invitations_organization_id_idx on public.organization_invitations(organization_id) where deleted_at is null;
create index if not exists organization_invitations_role_id_idx on public.organization_invitations(role_id) where deleted_at is null;

create table if not exists public.security_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  event_type public.security_event_type not null,
  success boolean not null default false,
  ip_address inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz
);

create index if not exists security_events_user_id_idx on public.security_events(user_id, created_at desc);
create index if not exists security_events_email_idx on public.security_events(email, created_at desc) where email is not null;
create index if not exists security_events_event_type_idx on public.security_events(event_type, created_at desc);

create table if not exists public.rate_limit_buckets (
  id uuid primary key default gen_random_uuid(),
  bucket_key text not null unique,
  window_start timestamptz not null default now(),
  request_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz
);

create index if not exists rate_limit_buckets_window_start_idx on public.rate_limit_buckets(window_start);

create trigger set_updated_at_organization_invitations before update on public.organization_invitations for each row execute function public.set_updated_at();
create trigger set_updated_at_security_events before update on public.security_events for each row execute function public.set_updated_at();
create trigger set_updated_at_rate_limit_buckets before update on public.rate_limit_buckets for each row execute function public.set_updated_at();

insert into public.permissions (key, description)
select module_name || '.' || action_name, initcap(replace(module_name, '_', ' ')) || ' ' || action_name
from unnest(array['clients','leads','projects','tasks','calendar','seo','campaigns','reports','invoices','billing','settings','users','roles','ai_features']) module_name
cross join unnest(array['view','create','update','delete','export','import','approve','assign']) action_name
on conflict (key) do nothing;

insert into public.permissions (key, description) values
  ('users.invite', 'Invite users'),
  ('users.deactivate', 'Deactivate users'),
  ('users.reactivate', 'Reactivate users'),
  ('organizations.view', 'View organization'),
  ('organizations.update', 'Update organization'),
  ('organizations.delete', 'Delete organization'),
  ('profile.update', 'Update profile')
on conflict (key) do nothing;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select p.is_super_admin from public.profiles p where p.id = auth.uid() and p.deleted_at is null), false);
$$;

create or replace function public.is_organization_member(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin()
    or exists (
      select 1
      from public.organization_members om
      where om.organization_id = p_organization_id
        and om.user_id = auth.uid()
        and om.status = 'active'
        and om.deleted_at is null
    );
$$;

create or replace function public.has_permission(p_organization_id uuid, p_permission_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin()
    or exists (
      select 1
      from public.organization_members om
      join public.roles r on r.id = om.role_id and r.deleted_at is null
      join public.role_permissions rp on rp.role_id = r.id and rp.deleted_at is null
      join public.permissions p on p.id = rp.permission_id and p.deleted_at is null
      where om.organization_id = p_organization_id
        and om.user_id = auth.uid()
        and om.status = 'active'
        and om.deleted_at is null
        and (om.member_role = 'owner' or p.key = p_permission_key)
    );
$$;

create or replace function public.is_organization_editor(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin()
    or public.has_permission(p_organization_id, 'settings.update')
    or public.has_permission(p_organization_id, 'clients.update')
    or public.has_permission(p_organization_id, 'projects.update')
    or public.has_permission(p_organization_id, 'tasks.update');
$$;

create or replace function public.provision_organization_rbac(p_organization_id uuid, p_owner_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  role_key text;
  role_id uuid;
  permission_record record;
  default_roles text[] := array['owner','admin','manager','marketing_manager','seo_specialist','content_writer','sales_manager','sales_executive','support_agent','viewer'];
begin
  foreach role_key in array default_roles loop
    insert into public.roles (organization_id, name, role_key, description, is_system, created_by)
    values (
      p_organization_id,
      initcap(replace(role_key, '_', ' ')),
      role_key,
      'System role for ' || replace(role_key, '_', ' '),
      true,
      p_owner_id
    )
    on conflict (organization_id, role_key) where deleted_at is null
    do update set name = excluded.name, description = excluded.description, is_system = true, updated_at = now()
    returning id into role_id;

    for permission_record in select id, key from public.permissions where deleted_at is null loop
      if role_key = 'owner'
        or (role_key = 'admin' and permission_record.key not like 'billing.delete')
        or (role_key = 'manager' and permission_record.key ~ '^(clients|leads|projects|tasks|calendar|campaigns|reports)\.')
        or (role_key = 'marketing_manager' and permission_record.key ~ '^(campaigns|clients|leads|reports|tasks|ai_features)\.')
        or (role_key = 'seo_specialist' and permission_record.key ~ '^(seo|clients|projects|tasks|reports|ai_features)\.')
        or (role_key = 'content_writer' and permission_record.key ~ '^(campaigns|seo|tasks|ai_features)\.(view|create|update|assign)$')
        or (role_key = 'sales_manager' and permission_record.key ~ '^(clients|leads|reports|tasks)\.')
        or (role_key = 'sales_executive' and permission_record.key ~ '^(clients|leads|tasks)\.(view|create|update|assign)$')
        or (role_key = 'support_agent' and permission_record.key ~ '^(clients|tasks|reports)\.(view|create|update|assign)$')
        or (role_key = 'viewer' and permission_record.key like '%.view')
      then
        insert into public.role_permissions (organization_id, role_id, permission_id, created_by)
        values (p_organization_id, role_id, permission_record.id, p_owner_id)
        on conflict (role_id, permission_id) where deleted_at is null do nothing;
      end if;
    end loop;
  end loop;
end;
$$;

create or replace function public.create_organization(p_name text, p_slug text)
returns public.organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  organization public.organizations;
  owner_role_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  perform set_config('app.organization_bootstrap', 'true', true);

  insert into public.organizations (name, slug, created_by)
  values (p_name, p_slug, auth.uid())
  returning * into organization;

  perform public.provision_organization_rbac(organization.id, auth.uid());

  select id into owner_role_id
  from public.roles
  where organization_id = organization.id and role_key = 'owner' and deleted_at is null
  limit 1;

  insert into public.organization_members (organization_id, user_id, role_id, member_role, status, created_by)
  values (organization.id, auth.uid(), owner_role_id, 'owner', 'active', auth.uid());

  update public.profiles set active_organization_id = organization.id where id = auth.uid();

  return organization;
end;
$$;

create or replace function public.create_invitation(p_organization_id uuid, p_email text, p_role_id uuid, p_token_hash text)
returns public.organization_invitations
language plpgsql
security definer
set search_path = public
as $$
declare
  invitation public.organization_invitations;
begin
  if not public.has_permission(p_organization_id, 'users.invite') then
    raise exception 'Permission denied';
  end if;

  insert into public.organization_invitations (organization_id, email, role_id, token_hash, invited_by, created_by)
  values (p_organization_id, lower(trim(p_email)), p_role_id, p_token_hash, auth.uid(), auth.uid())
  returning * into invitation;

  perform public.log_activity(p_organization_id, 'invitation.sent', 'organization_invitations', invitation.id, jsonb_build_object('email', invitation.email, 'role_id', p_role_id));
  return invitation;
end;
$$;

create or replace function public.accept_invitation(p_token_hash text)
returns public.organization_members
language plpgsql
security definer
set search_path = public
as $$
declare
  invitation public.organization_invitations;
  member public.organization_members;
  invitee_email text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select lower(email) into invitee_email from auth.users where id = auth.uid();

  select * into invitation
  from public.organization_invitations
  where token_hash = p_token_hash
    and status = 'pending'
    and deleted_at is null
    and expires_at > now()
  for update;

  if invitation.id is null then
    raise exception 'Invitation is invalid or expired';
  end if;

  if invitation.email <> invitee_email then
    raise exception 'Invitation email does not match current user';
  end if;

  perform set_config('app.organization_bootstrap', 'true', true);

  insert into public.organization_members (organization_id, user_id, role_id, member_role, status, invited_by, created_by)
  values (invitation.organization_id, auth.uid(), invitation.role_id, 'member', 'active', invitation.invited_by, invitation.invited_by)
  on conflict (organization_id, user_id) where deleted_at is null
  do update set role_id = excluded.role_id, status = 'active', deactivated_at = null, deactivated_by = null, updated_at = now()
  returning * into member;

  update public.organization_invitations
  set status = 'accepted', accepted_at = now(), accepted_by = auth.uid()
  where id = invitation.id;

  update public.profiles set active_organization_id = invitation.organization_id where id = auth.uid();

  perform public.log_activity(invitation.organization_id, 'invitation.accepted', 'organization_members', member.id, jsonb_build_object('email', invitation.email));
  return member;
end;
$$;

create or replace function public.update_member_status(p_member_id uuid, p_status public.organization_member_status)
returns public.organization_members
language plpgsql
security definer
set search_path = public
as $$
declare
  member public.organization_members;
begin
  select * into member from public.organization_members where id = p_member_id and deleted_at is null for update;
  if member.id is null then
    raise exception 'Member not found';
  end if;
  if not public.has_permission(member.organization_id, 'users.update') then
    raise exception 'Permission denied';
  end if;
  update public.organization_members
  set status = p_status,
      deactivated_at = case when p_status = 'inactive' then now() else null end,
      deactivated_by = case when p_status = 'inactive' then auth.uid() else null end
  where id = p_member_id
  returning * into member;
  return member;
end;
$$;

create or replace function public.check_rate_limit(p_bucket_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  bucket public.rate_limit_buckets;
  window_age interval := make_interval(secs => p_window_seconds);
begin
  insert into public.rate_limit_buckets(bucket_key, window_start, request_count, created_by)
  values (p_bucket_key, now(), 1, auth.uid())
  on conflict (bucket_key)
  do update set
    window_start = case when public.rate_limit_buckets.window_start < now() - window_age then now() else public.rate_limit_buckets.window_start end,
    request_count = case when public.rate_limit_buckets.window_start < now() - window_age then 1 else public.rate_limit_buckets.request_count + 1 end,
    updated_at = now()
  returning * into bucket;

  return bucket.request_count <= p_limit;
end;
$$;

alter table public.organization_invitations enable row level security;
alter table public.security_events enable row level security;
alter table public.rate_limit_buckets enable row level security;

create policy organization_invitations_select on public.organization_invitations for select using (public.has_permission(organization_id, 'users.view') or lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
create policy organization_invitations_insert on public.organization_invitations for insert with check (public.has_permission(organization_id, 'users.invite'));
create policy organization_invitations_update on public.organization_invitations for update using (public.has_permission(organization_id, 'users.update')) with check (public.has_permission(organization_id, 'users.update'));
create policy organization_invitations_delete on public.organization_invitations for delete using (public.has_permission(organization_id, 'users.delete'));

create policy security_events_select on public.security_events for select using (user_id = auth.uid() or public.is_super_admin() or (organization_id is not null and public.has_permission(organization_id, 'settings.view')));
create policy security_events_insert on public.security_events for insert with check (auth.uid() is not null or user_id is null);

create policy rate_limit_no_direct_select on public.rate_limit_buckets for select using (false);
create policy rate_limit_no_direct_write on public.rate_limit_buckets for all using (false) with check (false);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and is_super_admin = false);
