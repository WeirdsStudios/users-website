-- USERS Client Console: primera adopción del contrato USERS Core v0.1.
-- Esta migración se revisa y aplica deliberadamente; el build nunca la ejecuta.

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  slug text not null unique
    check (char_length(slug) between 2 and 80)
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status text not null default 'active'
    check (status in ('active', 'suspended', 'archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table organization_members (
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  status text not null default 'active'
    check (status in ('invited', 'active', 'disabled')),
  added_by uuid references auth.users(id) on delete set null,
  invited_at timestamptz,
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create index organization_members_user_id_idx
  on organization_members(user_id, organization_id)
  where status = 'active';

create trigger organizations_updated_at
before update on organizations
for each row execute function set_updated_at();

create trigger organization_members_updated_at
before update on organization_members
for each row execute function set_updated_at();

alter table organizations enable row level security;
alter table organization_members enable row level security;

create policy organization_members_read_own
on organization_members
for select
to authenticated
using (user_id = auth.uid());

create policy organizations_read_active_members
on organizations
for select
to authenticated
using (
  exists (
    select 1
    from organization_members membership
    where membership.organization_id = organizations.id
      and membership.user_id = auth.uid()
      and membership.status = 'active'
  )
);

revoke all on organizations from anon, authenticated;
revoke all on organization_members from anon, authenticated;
grant select on organizations to authenticated;
grant select on organization_members to authenticated;

alter table analisis_negocio
  add column organization_id uuid unique
  references organizations(id) on delete restrict;

create or replace function convert_users_lead_to_organization(
  p_analysis_id uuid,
  p_name text,
  p_slug text,
  p_owner_user_id uuid,
  p_owner_status text,
  p_staff_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target analisis_negocio%rowtype;
  v_organization_id uuid;
  normalized_name text := trim(p_name);
  base_slug text := lower(trim(p_slug));
  candidate_slug text;
begin
  select * into target
  from analisis_negocio
  where id = p_analysis_id
  for update;

  if not found then raise exception 'analysis not found'; end if;
  if target.organization_id is not null then return target.organization_id; end if;
  if target.status <> 'completado' then raise exception 'analysis is not completed'; end if;
  if normalized_name is null or char_length(normalized_name) not between 1 and 120 then
    raise exception 'organization name is invalid';
  end if;
  if base_slug is null or char_length(base_slug) not between 2 and 70
     or base_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'organization slug is invalid';
  end if;
  if p_owner_status not in ('invited', 'active') then raise exception 'owner status is invalid'; end if;
  if not exists (select 1 from auth.users where id = p_owner_user_id) then
    raise exception 'owner user not found';
  end if;
  if not exists (select 1 from auth.users where id = p_staff_user_id) then
    raise exception 'staff user not found';
  end if;

  candidate_slug := base_slug;
  while exists (select 1 from organizations where slug = candidate_slug) loop
    candidate_slug := base_slug || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
  end loop;

  insert into organizations (name, slug, created_by)
  values (normalized_name, candidate_slug, p_staff_user_id)
  returning id into v_organization_id;

  insert into organization_members (
    organization_id, user_id, role, status, added_by, invited_at, activated_at
  ) values (
    v_organization_id,
    p_owner_user_id,
    'owner',
    p_owner_status,
    p_staff_user_id,
    case when p_owner_status = 'invited' then now() else null end,
    case when p_owner_status = 'active' then now() else null end
  );

  update analisis_negocio
  set organization_id = v_organization_id
  where id = p_analysis_id;

  return v_organization_id;
end;
$$;

revoke all on function convert_users_lead_to_organization(uuid, text, text, uuid, text, uuid)
from public, anon, authenticated;
grant execute on function convert_users_lead_to_organization(uuid, text, text, uuid, text, uuid)
to service_role;

create or replace function activate_own_organization_memberships()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  update organization_members
  set status = 'active', activated_at = coalesce(activated_at, now())
  where user_id = auth.uid() and status = 'invited';
  get diagnostics affected = row_count;
  return affected;
end;
$$;

revoke all on function activate_own_organization_memberships() from public, anon;
grant execute on function activate_own_organization_memberships() to authenticated;
