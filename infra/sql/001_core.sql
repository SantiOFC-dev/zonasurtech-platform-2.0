-- Core multi-tenant schema (MVP v1)
create extension if not exists pgcrypto;

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  legal_name text not null,
  commercial_name text,
  country_code text not null default 'CR',
  timezone text not null default 'America/Costa_Rica',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin
  create type membership_role as enum ('owner','admin','operator','viewer');
exception
  when duplicate_object then null;
end $$;

create table if not exists memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null,
  role membership_role not null default 'viewer',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

create table if not exists plans (
  id text primary key,
  name text not null,
  rank int not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists tenant_subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  plan_id text not null references plans(id),
  status text not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists modules (
  module_key text primary key,
  name text not null,
  type text not null check (type in ('native','external')),
  status text not null check (status in ('active','beta','disabled')),
  route text not null,
  external_url text,
  required_plan text not null,
  created_at timestamptz not null default now()
);

create table if not exists tenant_modules (
  tenant_id uuid not null references tenants(id) on delete cascade,
  module_key text not null references modules(module_key) on delete cascade,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (tenant_id, module_key)
);

create table if not exists plan_entitlements (
  plan_id text not null references plans(id) on delete cascade,
  module_key text not null references modules(module_key) on delete cascade,
  feature_key text not null,
  enabled boolean not null default true,
  primary key (plan_id, module_key, feature_key)
);

create table if not exists module_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null,
  module_key text not null references modules(module_key),
  jti text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id bigserial primary key,
  tenant_id uuid references tenants(id) on delete set null,
  user_id uuid,
  action text not null,
  entity_type text,
  entity_id text,
  request_id text,
  ip_address inet,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_memberships_tenant_user on memberships(tenant_id, user_id);
create index if not exists idx_memberships_user on memberships(user_id);
create index if not exists idx_subscriptions_tenant on tenant_subscriptions(tenant_id);
create index if not exists idx_tenant_modules_tenant on tenant_modules(tenant_id);
create index if not exists idx_entitlements_plan_module on plan_entitlements(plan_id, module_key);
create index if not exists idx_module_sessions_tenant_user on module_sessions(tenant_id, user_id);
create index if not exists idx_module_sessions_expires on module_sessions(expires_at);
create index if not exists idx_audit_logs_tenant_created on audit_logs(tenant_id, created_at desc);
