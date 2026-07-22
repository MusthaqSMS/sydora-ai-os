-- Local development data only. Never apply this file to a production project.
begin;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'developer@sydora.local',
  crypt('development-only-password', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"full_name":"Sydora Developer"}', now(), now()
) on conflict (id) do nothing;

insert into public.organizations (id, name, slug, created_by)
values ('10000000-0000-0000-0000-000000000001', 'Sydora Development', 'sydora-development', '00000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

select set_config('app.organization_bootstrap', '10000000-0000-0000-0000-000000000001', true);

insert into public.roles (id, organization_id, name, description, created_by)
values ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Owner', 'Development organization owner', '00000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

insert into public.organization_members (organization_id, user_id, role_id, member_role, created_by)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'owner', '00000000-0000-0000-0000-000000000001')
on conflict (organization_id, user_id) do nothing;

insert into public.clients (id, organization_id, name, website, industry, created_by) values
('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Northstar Retail', 'https://northstar.example', 'Retail', '00000000-0000-0000-0000-000000000001'),
('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Crescent Health', 'https://crescent.example', 'Healthcare', '00000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

insert into public.lead_sources (id, organization_id, name, created_by) values
('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Website', '00000000-0000-0000-0000-000000000001') on conflict (id) do nothing;
insert into public.lead_statuses (id, organization_id, name, position, created_by) values
('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'New', 0, '00000000-0000-0000-0000-000000000001') on conflict (id) do nothing;
insert into public.leads (organization_id, source_id, status_id, name, email, company, estimated_value, created_by) values
('10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', 'Avery Morgan', 'avery@example.com', 'Orion Labs', 18000, '00000000-0000-0000-0000-000000000001');

insert into public.projects (id, organization_id, client_id, name, status, start_date, due_date, created_by) values
('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Northstar Growth Program', 'active', current_date, current_date + 90, '00000000-0000-0000-0000-000000000001') on conflict (id) do nothing;
insert into public.tasks (organization_id, project_id, assignee_id, title, priority, due_at, created_by) values
('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Validate campaign brief', 'high', now() + interval '3 days', '00000000-0000-0000-0000-000000000001');

insert into public.seo_projects (id, organization_id, client_id, project_id, website_url, status, created_by) values
('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'https://northstar.example', 'active', '00000000-0000-0000-0000-000000000001') on conflict (id) do nothing;
insert into public.seo_keywords (organization_id, seo_project_id, keyword, target_url, search_volume, created_by) values
('10000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'sustainable home goods', 'https://northstar.example', 2400, '00000000-0000-0000-0000-000000000001');

insert into public.marketing_campaigns (organization_id, client_id, name, channel, status, budget, starts_at, created_by) values
('10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Northstar Search Launch', 'search', 'active', 5000, now(), '00000000-0000-0000-0000-000000000001');
insert into public.notifications (organization_id, user_id, title, body, created_by) values
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Development workspace ready', 'Seed data was loaded successfully.', '00000000-0000-0000-0000-000000000001');

commit;
