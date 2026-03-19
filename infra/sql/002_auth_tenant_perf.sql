create index if not exists idx_memberships_user_status on memberships(user_id, status);
create index if not exists idx_subscriptions_tenant_status on tenant_subscriptions(tenant_id, status, created_at desc);
