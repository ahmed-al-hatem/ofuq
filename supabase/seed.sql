with demo_tenant as (
  insert into public.tenants (
    name,
    slug,
    status,
    locale,
    direction
  )
  values (
    'Ofuq Demo Tenant',
    'ofuq-demo',
    'active',
    'ar',
    'rtl'
  )
  on conflict (slug) do update
  set
    name = excluded.name,
    status = excluded.status,
    locale = excluded.locale,
    direction = excluded.direction
  returning id
)
insert into public.schools (
  tenant_id,
  name,
  slug,
  status
)
select
  demo_tenant.id,
  'مدرسة أفق التجريبية',
  'ofuq-demo-school',
  'active'
from demo_tenant
on conflict (tenant_id, slug) do update
set
  name = excluded.name,
  status = excluded.status;
