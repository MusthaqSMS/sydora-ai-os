insert into public.permissions (key, description)
select module_name || '.' || action_name, initcap(replace(module_name, '_', ' ')) || ' ' || action_name
from unnest(array['documents','data','search','ads','agency','notifications','integrations']) module_name
cross join unnest(array['view','create','update','delete','export','import','approve','assign']) action_name
on conflict (key) do nothing;

alter table public.documents add column if not exists lead_id uuid references public.leads(id) on delete set null;
alter table public.notifications add column if not exists type text not null default 'in_app';

create index if not exists documents_lead_id_idx on public.documents(lead_id) where deleted_at is null;
create index if not exists calendar_events_starts_at_idx on public.calendar_events(organization_id, starts_at) where deleted_at is null;
create index if not exists integrations_provider_idx on public.integrations(organization_id, provider) where deleted_at is null;

insert into public.role_permissions (organization_id, role_id, permission_id, created_by)
select r.organization_id, r.id, p.id, r.created_by
from public.roles r
join public.permissions p on p.deleted_at is null
where r.deleted_at is null
  and (
    r.role_key = 'owner'
    or (r.role_key = 'admin' and p.key not like 'billing.delete')
    or (r.role_key = 'manager' and p.key ~ '^(documents|data|search|notifications)\.')
    or (r.role_key = 'marketing_manager' and p.key ~ '^(ads|integrations|notifications|search)\.(view|create|update|export)$')
    or (r.role_key = 'seo_specialist' and p.key ~ '^(integrations|search|documents)\.(view|create|update|export)$')
    or (r.role_key = 'sales_manager' and p.key ~ '^(search|notifications|documents)\.(view|create|update|export)$')
    or (r.role_key = 'viewer' and p.key like '%.view')
  )
on conflict (role_id, permission_id) where deleted_at is null do nothing;

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
        or (role_key = 'manager' and permission_record.key ~ '^(clients|leads|projects|tasks|calendar|campaigns|reports|documents|data|search|notifications)\.')
        or (role_key = 'marketing_manager' and permission_record.key ~ '^(campaigns|clients|leads|reports|tasks|ai_features|ads|integrations|notifications|search)\.')
        or (role_key = 'seo_specialist' and permission_record.key ~ '^(seo|clients|projects|tasks|reports|ai_features|integrations|search|documents)\.')
        or (role_key = 'content_writer' and permission_record.key ~ '^(campaigns|seo|tasks|ai_features|documents)\.(view|create|update|assign)$')
        or (role_key = 'sales_manager' and permission_record.key ~ '^(clients|leads|reports|tasks|search|notifications|documents)\.')
        or (role_key = 'sales_executive' and permission_record.key ~ '^(clients|leads|tasks|search)\.(view|create|update|assign)$')
        or (role_key = 'support_agent' and permission_record.key ~ '^(clients|tasks|reports|notifications|documents)\.(view|create|update|assign)$')
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
