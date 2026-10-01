-- Consola operativa compartida de USERS.
--
-- Cada registro pertenece a una organización. No existe un tenant por defecto:
-- las políticas RLS exigen una membresía activa para cada lectura. Las páginas
-- del servidor validan también la organización en la URL antes de escribir.

create table business_products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 160),
  sku text check (sku is null or char_length(trim(sku)) between 1 and 80),
  description text check (description is null or char_length(description) <= 2000),
  price_cents integer not null check (price_cents between 0 and 100000000),
  offer_price_cents integer check (offer_price_cents is null or offer_price_cents between 0 and price_cents),
  currency char(3) not null default 'MXN' check (currency ~ '^[A-Z]{3}$'),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, sku)
);

create table business_customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 160),
  email text check (email is null or char_length(email) <= 254),
  phone text check (phone is null or char_length(phone) <= 40),
  notes text check (notes is null or char_length(notes) <= 2000),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (email is not null or phone is not null)
);

create table business_quotes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  quote_number bigint generated always as identity,
  customer_id uuid not null references business_customers(id) on delete restrict,
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'rejected', 'expired', 'cancelled')),
  currency char(3) not null default 'MXN' check (currency ~ '^[A-Z]{3}$'),
  subtotal_cents integer not null check (subtotal_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  valid_until date,
  notes text check (notes is null or char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, quote_number)
);

create table business_quote_lines (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  quote_id uuid not null references business_quotes(id) on delete cascade,
  product_id uuid references business_products(id) on delete set null,
  product_name text not null check (char_length(product_name) between 1 and 160),
  quantity numeric(12,3) not null check (quantity > 0 and quantity <= 100000),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  line_total_cents integer not null check (line_total_cents >= 0)
);

create table business_sales (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  sale_number bigint generated always as identity,
  customer_id uuid references business_customers(id) on delete restrict,
  status text not null default 'completed' check (status in ('completed', 'voided', 'refunded')),
  currency char(3) not null default 'MXN' check (currency ~ '^[A-Z]{3}$'),
  subtotal_cents integer not null check (subtotal_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  payment_method text check (payment_method is null or char_length(payment_method) <= 80),
  notes text check (notes is null or char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, sale_number)
);

create table business_sale_lines (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  sale_id uuid not null references business_sales(id) on delete cascade,
  product_id uuid references business_products(id) on delete set null,
  product_name text not null check (char_length(product_name) between 1 and 160),
  quantity numeric(12,3) not null check (quantity > 0 and quantity <= 100000),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  line_total_cents integer not null check (line_total_cents >= 0)
);

create index business_products_org_idx on business_products(organization_id, status, name);
create index business_customers_org_idx on business_customers(organization_id, status, name);
create index business_quotes_org_idx on business_quotes(organization_id, created_at desc);
create index business_sales_org_idx on business_sales(organization_id, created_at desc);
create index business_quote_lines_quote_idx on business_quote_lines(quote_id);
create index business_sale_lines_sale_idx on business_sale_lines(sale_id);

create trigger business_products_updated_at before update on business_products for each row execute function set_updated_at();
create trigger business_customers_updated_at before update on business_customers for each row execute function set_updated_at();
create trigger business_quotes_updated_at before update on business_quotes for each row execute function set_updated_at();
create trigger business_sales_updated_at before update on business_sales for each row execute function set_updated_at();

alter table business_products enable row level security;
alter table business_customers enable row level security;
alter table business_quotes enable row level security;
alter table business_quote_lines enable row level security;
alter table business_sales enable row level security;
alter table business_sale_lines enable row level security;

-- Una misma regla declarativa para todas las lecturas del portal. Las
-- escrituras se hacen exclusivamente por acciones de servidor verificadas.
create policy business_products_read_member on business_products for select to authenticated using (exists (select 1 from organization_members m where m.organization_id = business_products.organization_id and m.user_id = auth.uid() and m.status = 'active'));
create policy business_customers_read_member on business_customers for select to authenticated using (exists (select 1 from organization_members m where m.organization_id = business_customers.organization_id and m.user_id = auth.uid() and m.status = 'active'));
create policy business_quotes_read_member on business_quotes for select to authenticated using (exists (select 1 from organization_members m where m.organization_id = business_quotes.organization_id and m.user_id = auth.uid() and m.status = 'active'));
create policy business_quote_lines_read_member on business_quote_lines for select to authenticated using (exists (select 1 from organization_members m where m.organization_id = business_quote_lines.organization_id and m.user_id = auth.uid() and m.status = 'active'));
create policy business_sales_read_member on business_sales for select to authenticated using (exists (select 1 from organization_members m where m.organization_id = business_sales.organization_id and m.user_id = auth.uid() and m.status = 'active'));
create policy business_sale_lines_read_member on business_sale_lines for select to authenticated using (exists (select 1 from organization_members m where m.organization_id = business_sale_lines.organization_id and m.user_id = auth.uid() and m.status = 'active'));

revoke all on business_products, business_customers, business_quotes, business_quote_lines, business_sales, business_sale_lines from anon, authenticated;
grant select on business_products, business_customers, business_quotes, business_quote_lines, business_sales, business_sale_lines to authenticated;
grant all on business_products, business_customers, business_quotes, business_quote_lines, business_sales, business_sale_lines to service_role;

-- Alta manual para el CRM: deja el negocio listo como una conversión de lead,
-- pero sin inventar un lead previo.
create or replace function create_users_organization(
  p_name text,
  p_slug text,
  p_owner_user_id uuid,
  p_owner_status text,
  p_staff_user_id uuid
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_slug text := lower(trim(p_slug)); v_candidate text; begin
  if char_length(trim(p_name)) not between 1 and 120 or v_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or p_owner_status not in ('invited','active') then raise exception 'invalid organization'; end if;
  v_candidate := v_slug;
  while exists (select 1 from organizations where slug = v_candidate) loop v_candidate := v_slug || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8); end loop;
  insert into organizations(name, slug, created_by) values(trim(p_name), v_candidate, p_staff_user_id) returning id into v_id;
  insert into organization_members(organization_id,user_id,role,status,added_by,invited_at,activated_at) values(v_id,p_owner_user_id,'owner',p_owner_status,p_staff_user_id,case when p_owner_status='invited' then now() end,case when p_owner_status='active' then now() end);
  return v_id;
end; $$;
revoke all on function create_users_organization(text,text,uuid,text,uuid) from public, anon, authenticated;
grant execute on function create_users_organization(text,text,uuid,text,uuid) to service_role;
