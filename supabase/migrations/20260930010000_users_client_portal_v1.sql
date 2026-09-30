-- USERS Client Portal V1: superficie compartida entre USERS y cada cliente.
-- Los datos operativos del negocio (catálogo, ventas y clientes finales)
-- permanecen fuera de esta base, dentro de su Client Foundation aislada.

create table client_portal_projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  source_crm_project_id uuid unique references crm_projects(id) on delete set null,
  title text not null check (char_length(trim(title)) between 1 and 200),
  client_summary text,
  status text not null default 'planned'
    check (status in ('planned', 'in_progress', 'waiting_you', 'paused', 'complete', 'cancelled')),
  target_date date,
  published_at timestamptz not null default now(),
  published_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table client_portal_deliverables (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  portal_project_id uuid references client_portal_projects(id) on delete set null,
  title text not null check (char_length(trim(title)) between 1 and 200),
  description text,
  status text not null default 'in_progress'
    check (status in ('planned', 'in_progress', 'review', 'ready', 'accepted')),
  due_on date,
  url text,
  published_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table client_portal_invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  source_crm_invoice_id uuid unique references crm_invoices(id) on delete set null,
  reference text not null check (char_length(trim(reference)) between 3 and 80),
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'partial', 'paid', 'overdue', 'void')),
  total numeric(12, 2) not null default 0 check (total >= 0),
  currency char(3) not null default 'MXN',
  due_on date,
  document_url text,
  published_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table client_portal_console_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  label text not null check (char_length(trim(label)) between 1 and 120),
  description text,
  url text not null check (url ~ '^https://'),
  status text not null default 'active' check (status in ('active', 'maintenance')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table client_portal_support_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  subject text not null check (char_length(trim(subject)) between 3 and 180),
  body text not null check (char_length(trim(body)) between 3 and 5000),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  status text not null default 'received'
    check (status in ('received', 'in_progress', 'waiting_client', 'resolved', 'closed')),
  submitted_by uuid not null references auth.users(id) on delete restrict,
  staff_response text,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index client_portal_projects_org_idx on client_portal_projects(organization_id, target_date);
create index client_portal_deliverables_org_idx on client_portal_deliverables(organization_id, due_on);
create index client_portal_invoices_org_idx on client_portal_invoices(organization_id, due_on);
create index client_portal_console_links_org_idx on client_portal_console_links(organization_id, status);
create index client_portal_support_requests_org_idx on client_portal_support_requests(organization_id, created_at desc);

create trigger client_portal_projects_updated_at before update on client_portal_projects
for each row execute function set_updated_at();
create trigger client_portal_deliverables_updated_at before update on client_portal_deliverables
for each row execute function set_updated_at();
create trigger client_portal_invoices_updated_at before update on client_portal_invoices
for each row execute function set_updated_at();
create trigger client_portal_console_links_updated_at before update on client_portal_console_links
for each row execute function set_updated_at();
create trigger client_portal_support_requests_updated_at before update on client_portal_support_requests
for each row execute function set_updated_at();

alter table client_portal_projects enable row level security;
alter table client_portal_deliverables enable row level security;
alter table client_portal_invoices enable row level security;
alter table client_portal_console_links enable row level security;
alter table client_portal_support_requests enable row level security;

-- Una membresía activa es el único camino de lectura/escritura desde el portal.
create policy client_portal_projects_read_organization
on client_portal_projects for select to authenticated
using (exists (
  select 1 from organization_members membership
  where membership.organization_id = client_portal_projects.organization_id
    and membership.user_id = auth.uid()
    and membership.status = 'active'
));

create policy client_portal_deliverables_read_organization
on client_portal_deliverables for select to authenticated
using (exists (
  select 1 from organization_members membership
  where membership.organization_id = client_portal_deliverables.organization_id
    and membership.user_id = auth.uid()
    and membership.status = 'active'
));

create policy client_portal_invoices_read_organization
on client_portal_invoices for select to authenticated
using (exists (
  select 1 from organization_members membership
  where membership.organization_id = client_portal_invoices.organization_id
    and membership.user_id = auth.uid()
    and membership.status = 'active'
));

create policy client_portal_console_links_read_organization
on client_portal_console_links for select to authenticated
using (exists (
  select 1 from organization_members membership
  where membership.organization_id = client_portal_console_links.organization_id
    and membership.user_id = auth.uid()
    and membership.status = 'active'
));

create policy client_portal_support_read_organization
on client_portal_support_requests for select to authenticated
using (exists (
  select 1 from organization_members membership
  where membership.organization_id = client_portal_support_requests.organization_id
    and membership.user_id = auth.uid()
    and membership.status = 'active'
));

create policy client_portal_support_create_own_organization
on client_portal_support_requests for insert to authenticated
with check (
  submitted_by = auth.uid()
  and exists (
    select 1 from organization_members membership
    where membership.organization_id = client_portal_support_requests.organization_id
      and membership.user_id = auth.uid()
      and membership.status = 'active'
  )
);

revoke all on client_portal_projects, client_portal_deliverables,
  client_portal_invoices, client_portal_console_links, client_portal_support_requests
from anon, authenticated;
grant select on client_portal_projects, client_portal_deliverables,
  client_portal_invoices, client_portal_console_links to authenticated;
grant select, insert on client_portal_support_requests to authenticated;
grant all on client_portal_projects, client_portal_deliverables,
  client_portal_invoices, client_portal_console_links, client_portal_support_requests
to service_role;
