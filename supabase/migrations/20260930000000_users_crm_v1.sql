-- USERS CRM V1: datos internos de la relación comercial de USERS.
-- Esta migración es aditiva. No elimina ni modifica datos de prospectos,
-- organizaciones, membresías o cuentas existentes.

create table crm_companies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid unique references organizations(id) on delete restrict,
  analysis_id uuid unique references analisis_negocio(id) on delete set null,
  name text not null check (char_length(trim(name)) between 1 and 160),
  status text not null default 'lead'
    check (status in ('lead', 'prospect', 'client', 'former_client', 'archived')),
  industry text,
  website text,
  phone text,
  billing_email text,
  owner_user_id uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table crm_contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references crm_companies(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 160),
  email text,
  phone text,
  job_title text,
  is_primary boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table crm_opportunities (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references crm_companies(id) on delete restrict,
  contact_id uuid references crm_contacts(id) on delete set null,
  title text not null check (char_length(trim(title)) between 1 and 200),
  stage text not null default 'new'
    check (stage in ('new', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
  amount numeric(12, 2) check (amount is null or amount >= 0),
  currency char(3) not null default 'MXN',
  expected_close_on date,
  description text,
  owner_user_id uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table crm_projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references crm_companies(id) on delete restrict,
  opportunity_id uuid references crm_opportunities(id) on delete set null,
  name text not null check (char_length(trim(name)) between 1 and 200),
  status text not null default 'planning'
    check (status in ('planning', 'active', 'waiting_client', 'paused', 'completed', 'cancelled')),
  health text not null default 'on_track'
    check (health in ('on_track', 'attention', 'blocked')),
  summary text,
  started_on date,
  target_date date,
  completed_on date,
  manager_user_id uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table crm_tasks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references crm_companies(id) on delete cascade,
  project_id uuid references crm_projects(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 240),
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'waiting', 'done', 'cancelled')),
  priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high', 'urgent')),
  due_on date,
  assignee_user_id uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (company_id is not null or project_id is not null)
);

create table crm_notes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references crm_companies(id) on delete cascade,
  contact_id uuid references crm_contacts(id) on delete cascade,
  opportunity_id uuid references crm_opportunities(id) on delete cascade,
  project_id uuid references crm_projects(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 10000),
  author_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (company_id is not null or contact_id is not null or opportunity_id is not null or project_id is not null)
);

create table crm_quotes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references crm_companies(id) on delete restrict,
  opportunity_id uuid references crm_opportunities(id) on delete set null,
  reference text not null unique check (char_length(trim(reference)) between 3 and 80),
  title text not null check (char_length(trim(title)) between 1 and 200),
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'accepted', 'rejected', 'expired', 'cancelled')),
  currency char(3) not null default 'MXN',
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  tax numeric(12, 2) not null default 0 check (tax >= 0),
  total numeric(12, 2) not null default 0 check (total >= 0),
  issued_on date,
  valid_until date,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table crm_invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references crm_companies(id) on delete restrict,
  quote_id uuid references crm_quotes(id) on delete set null,
  reference text not null unique check (char_length(trim(reference)) between 3 and 80),
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'partial', 'paid', 'overdue', 'void')),
  currency char(3) not null default 'MXN',
  total numeric(12, 2) not null default 0 check (total >= 0),
  issued_on date,
  due_on date,
  paid_on date,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index crm_companies_status_idx on crm_companies(status, updated_at desc);
create index crm_contacts_company_idx on crm_contacts(company_id, updated_at desc);
create index crm_opportunities_stage_idx on crm_opportunities(stage, expected_close_on);
create index crm_projects_company_status_idx on crm_projects(company_id, status, target_date);
create index crm_tasks_open_idx on crm_tasks(status, due_on) where status not in ('done', 'cancelled');
create index crm_notes_company_idx on crm_notes(company_id, created_at desc);
create index crm_quotes_company_status_idx on crm_quotes(company_id, status, valid_until);
create index crm_invoices_company_status_idx on crm_invoices(company_id, status, due_on);

create trigger crm_companies_updated_at before update on crm_companies
for each row execute function set_updated_at();
create trigger crm_contacts_updated_at before update on crm_contacts
for each row execute function set_updated_at();
create trigger crm_opportunities_updated_at before update on crm_opportunities
for each row execute function set_updated_at();
create trigger crm_projects_updated_at before update on crm_projects
for each row execute function set_updated_at();
create trigger crm_tasks_updated_at before update on crm_tasks
for each row execute function set_updated_at();
create trigger crm_notes_updated_at before update on crm_notes
for each row execute function set_updated_at();
create trigger crm_quotes_updated_at before update on crm_quotes
for each row execute function set_updated_at();
create trigger crm_invoices_updated_at before update on crm_invoices
for each row execute function set_updated_at();

-- Toda organización creada posteriormente por la conversión de un lead queda
-- disponible también en el CRM sin requerir una segunda acción manual.
create or replace function crm_create_company_from_organization()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into crm_companies (organization_id, name, status, created_by)
  values (new.id, new.name, 'client', new.created_by)
  on conflict (organization_id) do nothing;
  return new;
end;
$$;

create trigger organizations_create_crm_company
after insert on organizations
for each row execute function crm_create_company_from_organization();

-- Las organizaciones ya convertidas se ven inmediatamente como empresas del CRM.
insert into crm_companies (organization_id, analysis_id, name, status, industry, owner_user_id, created_by)
select
  organization.id,
  analysis.id,
  organization.name,
  'client',
  analysis.giro,
  owner_membership.user_id,
  organization.created_by
from organizations organization
left join analisis_negocio analysis on analysis.organization_id = organization.id
left join organization_members owner_membership
  on owner_membership.organization_id = organization.id
  and owner_membership.role = 'owner'
on conflict (organization_id) do nothing;

alter table crm_companies enable row level security;
alter table crm_contacts enable row level security;
alter table crm_opportunities enable row level security;
alter table crm_projects enable row level security;
alter table crm_tasks enable row level security;
alter table crm_notes enable row level security;
alter table crm_quotes enable row level security;
alter table crm_invoices enable row level security;

-- El CRM es interno. Las páginas usan el cliente de servidor con service_role,
-- mientras que usuarios autenticados normales no reciben acceso directo a estas tablas.
revoke all on crm_companies, crm_contacts, crm_opportunities, crm_projects,
  crm_tasks, crm_notes, crm_quotes, crm_invoices from anon, authenticated;
grant all on crm_companies, crm_contacts, crm_opportunities, crm_projects,
  crm_tasks, crm_notes, crm_quotes, crm_invoices to service_role;
